# Page Build Log

Per-page build history. Kept out of `AGENTS.md` so the always-loaded instructions
stay lean.

**Read the relevant page's section here before working on that page**, and append
new build narratives here — not in `AGENTS.md`.

The slim index (file ↔ Webflow page id + outstanding gaps) lives in `AGENTS.md` →
Pages Index. Recurring API and builder gotchas discovered during transfers get
consolidated in `AGENTS.md` → "Transferring the Static Build into Webflow", so
the next page benefits without anyone having to read this whole file.

Publish state is deliberately **not** tracked in the repo — check Webflow.

---

## Entry format

Add a `##` section per page, in the order the pages were built. Within a section,
append dated entries newest-last so the narrative reads chronologically.

```markdown
## <Page name> — `template/<file>.html`

**Purpose:** one line — what this page is for

**Sections:** the section stack, in document order

**History:**

**YYYY-MM-DD: <short title of the change>** — what changed and, more importantly,
*why*: the problem observed, the approach rejected and the reason, the values that
turned out to matter. Note anything transferred to Webflow (with element/class
names), anything that must still be done by hand in the Designer, and anything
verified vs. assumed.
```

What makes an entry worth writing: the reasoning that is not recoverable from the
diff. A future agent can read the CSS; it cannot read why three other approaches
were tried first, which browser disagreed, or which Designer step has no MCP
equivalent.

---

<!-- No pages logged yet. The first /page or /webflow-page run should add its
     section above this line. -->
