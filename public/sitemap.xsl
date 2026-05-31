<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EMINENT — Sitemap</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            background: #000000;
            color: #fafafa;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.5;
            min-height: 100vh;
            padding: 2rem 1rem 4rem;
          }

          .container {
            margin: 0 auto;
            max-width: 72rem;
          }

          header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
          }

          h1 {
            font-size: 1.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .subtitle {
            color: #b4b4b4;
            font-size: 0.95rem;
            margin-top: 0.35rem;
          }

          .summary {
            color: #b4b4b4;
            font-size: 0.875rem;
            margin-bottom: 1.25rem;
          }

          .table-wrap {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.625rem;
            overflow-x: auto;
          }

          table {
            border-collapse: collapse;
            width: 100%;
          }

          thead {
            background: #343434;
          }

          th {
            color: #b4b4b4;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            padding: 0.75rem 1rem;
            text-align: left;
            text-transform: uppercase;
          }

          td {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.875rem;
            padding: 0.75rem 1rem;
            vertical-align: top;
          }

          tbody tr:hover {
            background: rgba(255, 255, 255, 0.04);
          }

          a {
            color: #fafafa;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.8125rem;
            text-decoration: none;
            word-break: break-all;
          }

          a:hover {
            text-decoration: underline;
          }

          .date {
            color: #b4b4b4;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
          }

          footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #b4b4b4;
            font-size: 0.8125rem;
            margin-top: 2rem;
            padding-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>EMINENT</h1>
            <p class="subtitle">Sitemap</p>
          </header>

          <p class="summary">
            <xsl:value-of select="count(s:urlset/s:url)" /> URLs indexed
          </p>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td>
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc" />
                      </a>
                    </td>
                    <td class="date">
                      <xsl:value-of select="s:lastmod" />
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            <p>EMINENT MEDIA LLC — XML sitemap for search engines</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
