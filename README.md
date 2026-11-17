# KhataClerk Website

Static marketing website for KhataClerk, owned by Perceptive Labs Private Limited.

## Resources articles

Published articles are Markdown files in `_posts/` with YAML frontmatter. Use a filename beginning with the publication date, for example `_posts/2026-11-16-what-is-invoice-automation.md`, and set `layout: article`, `title`, `description`, `date`, `categories`, and `author`. The article layout generates the page metadata, canonical URL, social cards, breadcrumb, and BlogPosting JSON-LD. Set `image` only when an article image exists; include descriptive alt text for each image in Markdown.

Unpublished work belongs in `_drafts/`. Drafts are excluded from the public build by default. To preview locally, install Ruby and a compatible Jekyll version, then run `jekyll serve --drafts` from the repository root. GitHub Pages builds the committed `_posts/` articles automatically; drafts remain unpublished.

The Resources index is generated from published posts. `sitemap.xml` is a Jekyll template and updates with public HTML pages and published posts. No Node.js, npm, CMS, or extra Jekyll plugin is required.

## GitHub Pages deployment

The repository contains a `CNAME` for `www.khataclerk.com`, but it does not contain a GitHub Actions workflow or other configuration identifying the Pages publishing source. Before publishing, confirm in the repository’s **Settings → Pages** that the source is a branch and folder processed by GitHub Pages’ built-in Jekyll build (for example, the repository root on the current publishing branch). This implementation does not change GitHub deployment settings.
