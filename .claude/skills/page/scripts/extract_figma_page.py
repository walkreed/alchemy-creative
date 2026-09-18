#!/usr/bin/env python3
"""
Extract structured data from a Figma get_design_context output file for a page.

When `get_design_context` is called on a large page or section, the response
is saved to a file. This script parses that file and extracts:

  - sections: direct child frames (for drilling further)
  - images:   every image reference with id, name, dimensions
  - text:     every text node with its position and content
  - all:      runs every mode

Usage:
  python3 extract_figma_page.py <saved-file> --mode sections
  python3 extract_figma_page.py <saved-file> --mode images
  python3 extract_figma_page.py <saved-file> --mode text
  python3 extract_figma_page.py <saved-file> --mode all
"""

import sys
import json
import re
import argparse


def load_figma_output(path):
    """Load a Figma MCP saved output file (JSON array of text chunks, or plain text)."""
    with open(path) as f:
        try:
            data = json.load(f)
            if isinstance(data, list):
                return "\n".join(item.get("text", "") for item in data if isinstance(item, dict))
        except json.JSONDecodeError:
            f.seek(0)
            return f.read()
    return ""


def extract_sections(xml, max_results=50):
    """
    Direct child frames of the root frame. These usually correspond to page sections.

    Heuristic: find the outermost `<frame>` element, then return its direct children.
    Returns a list of dicts with id, name, x, y, width, height.
    """
    # Find every frame opening tag with its attributes
    frame_re = re.compile(
        r'<frame\s+id="([^"]+)"\s+name="([^"]+)"\s+x="([^"]*)"\s+y="([^"]*)"'
        r'\s+width="([^"]*)"\s+height="([^"]*)"'
    )
    matches = frame_re.findall(xml)
    if not matches:
        return []

    # Skip the outermost frame (the page itself); return the direct children.
    # The outermost frame is the first match. Direct children are frames at
    # the next nesting level — approximate by taking matches 1..N at the
    # outermost depth that we can detect.
    sections = []
    # Build a list by finding child frames inside the outermost element.
    # Simple approach: take all top-level frames except the first; in practice
    # we want frames that are direct children of the root, which we approximate
    # by depth tracking.

    depth = 0
    root_seen = False
    pos = 0
    for m in re.finditer(r'<frame\s+id="([^"]+)"\s+name="([^"]+)"[^>]*>|</frame>', xml):
        tag = m.group(0)
        if tag.startswith('</frame>'):
            depth -= 1
            continue
        if not root_seen:
            root_seen = True
            depth += 1
            continue
        if depth == 1:
            # Direct child of root — capture full attributes
            full = frame_re.search(tag)
            if full:
                fid, name, x, y, w, h = full.groups()
                sections.append({
                    "id": fid, "name": name,
                    "x": x, "y": y, "width": w, "height": h
                })
        depth += 1
        if len(sections) >= max_results:
            break

    return sections


def extract_images(xml):
    """
    Extract image references: any node that's an image or has an image fill.
    Returns list of {id, name, width, height, asset_url?}.
    """
    images = []

    # Pattern 1: <image id="..." name="..." width="..." height="..." />
    for m in re.finditer(
        r'<image\s+id="([^"]+)"\s+name="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"',
        xml
    ):
        images.append({
            "id": m.group(1),
            "name": m.group(2),
            "width": m.group(3),
            "height": m.group(4),
            "type": "image"
        })

    # Pattern 2: rectangle/frame with image fill
    for m in re.finditer(
        r'<(rectangle|frame)\s+id="([^"]+)"\s+name="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*fill="image:([^"]+)"',
        xml
    ):
        images.append({
            "id": m.group(2),
            "name": m.group(3),
            "width": m.group(4),
            "height": m.group(5),
            "asset_url": m.group(6),
            "type": "image-fill"
        })

    # Pattern 3: explicit assetUrl or imageRef attribute
    for m in re.finditer(
        r'<\w+\s+id="([^"]+)"\s+name="([^"]+)"[^>]*(?:assetUrl|imageRef|imageUrl)="([^"]+)"',
        xml
    ):
        images.append({
            "id": m.group(1),
            "name": m.group(2),
            "asset_url": m.group(3),
            "type": "asset-ref"
        })

    return images


def extract_text(xml, max_results=200):
    """
    Extract text nodes with name (content), id, and position.
    Returns list of {id, content, x, y, width}.
    """
    texts = []
    for m in re.finditer(
        r'<text\s+id="([^"]+)"\s+name="([^"]+)"(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?'
        r'(?:\s+width="([^"]*)")?(?:\s+height="([^"]*)")?',
        xml
    ):
        texts.append({
            "id": m.group(1),
            "content": m.group(2),
            "x": m.group(3) or "",
            "y": m.group(4) or "",
            "width": m.group(5) or "",
            "height": m.group(6) or "",
        })
        if len(texts) >= max_results:
            break
    return texts


def print_sections(sections):
    print("# Sections (direct child frames)\n")
    for s in sections:
        print(f"  id={s['id']:<14}  {s['name']:<40}  {s['width']}x{s['height']}")
    print(f"\n# Total: {len(sections)}\n")


def print_images(images):
    print("# Images\n")
    for img in images:
        line = f"  id={img['id']:<14}  {img.get('name', ''):<30}"
        if 'width' in img:
            line += f"  {img['width']}x{img['height']}"
        if 'asset_url' in img:
            line += f"  url={img['asset_url'][:60]}"
        print(line)
    print(f"\n# Total: {len(images)} images\n")


def print_text(texts):
    print("# Text nodes (document order)\n")
    for t in texts:
        # Trim very long content for readability
        content = t['content'] if len(t['content']) <= 80 else t['content'][:77] + "..."
        print(f"  id={t['id']:<14}  {content}")
    print(f"\n# Total: {len(texts)} text nodes\n")


def main():
    parser = argparse.ArgumentParser(
        description="Extract structured data from a saved Figma page response"
    )
    parser.add_argument("file", help="Path to the saved Figma MCP output file")
    parser.add_argument(
        "--mode", choices=["sections", "images", "text", "all"], default="sections"
    )
    args = parser.parse_args()

    xml = load_figma_output(args.file)
    if not xml.strip():
        print("ERROR: file is empty or unreadable", file=sys.stderr)
        sys.exit(1)

    modes = [args.mode] if args.mode != "all" else ["sections", "images", "text"]
    for mode in modes:
        if mode == "sections":
            print_sections(extract_sections(xml))
        elif mode == "images":
            print_images(extract_images(xml))
        elif mode == "text":
            print_text(extract_text(xml))


if __name__ == "__main__":
    main()
