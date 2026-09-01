import { ref } from 'vue'

/**
 * Turns the hidden <ScrapbookExport> sheet into a downloadable PDF, one
 * A4 page per `.export-page` element. `jspdf` is loaded on demand so it
 * stays out of the initial bundle.
 */
export function useScrapbookPdf() {
  const exporting = ref(false)
  const error = ref(false)

  // A4 portrait at 96dpi.
  const PAGE_W = 794
  const PAGE_H = 1123

  // Only the faces the export sheet actually uses.
  const FONT_CSS_URL =
    'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&family=Patrick+Hand&display=swap'
  const GSTATIC_URL = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g

  let fontCssCache: string | null = null

  /**
   * html-to-image renders into an SVG <foreignObject>, which is drawn to a
   * canvas — external font URLs never load in that context, so the woff2
   * files have to be inlined as data URIs. The browser's own font cache
   * can't be read cross-origin, so fetch and encode them ourselves.
   */
  async function fontEmbedCss(): Promise<string> {
    if (fontCssCache != null) return fontCssCache
    try {
      const css = await fetch(FONT_CSS_URL).then((res) => res.text())
      const urls = [...new Set([...css.matchAll(GSTATIC_URL)].map((m) => m[1]))]
      const dataUris = new Map<string, string>()
      await Promise.all(
        urls.map(async (url) => {
          const res = await fetch(url)
          const bytes = new Uint8Array(await res.arrayBuffer())
          let binary = ''
          for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
          dataUris.set(url, `data:font/woff2;base64,${btoa(binary)}`)
        }),
      )
      fontCssCache = css.replace(GSTATIC_URL, (_match, url) => `url(${dataUris.get(url) ?? url})`)
    } catch (err) {
      console.warn('Could not inline fonts for PDF export', err)
      fontCssCache = ''
    }
    return fontCssCache
  }

  async function exportPdf(container: HTMLElement | null, filename = 'Captured Wishes.pdf') {
    if (!container || exporting.value) return
    exporting.value = true
    error.value = false
    try {
      const pages = Array.from(container.querySelectorAll<HTMLElement>('.export-page'))
      if (!pages.length) return

      if (document.fonts?.ready) await document.fonts.ready
      const [{ toJpeg }, fontCss] = await Promise.all([import('html-to-image'), fontEmbedCss()])

      const images: string[] = []
      for (const page of pages) {
        images.push(
          await toJpeg(page, {
            width: PAGE_W,
            height: PAGE_H,
            // ~150dpi for A4 — sharp on screen, fine for print, keeps the file small.
            pixelRatio: 1.5,
            quality: 0.92,
            cacheBust: true,
            backgroundColor: '#faf3e7',
            fontEmbedCSS: fontCss,
            skipFonts: fontCss === '',
          }),
        )
      }

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        unit: 'px',
        format: [PAGE_W, PAGE_H],
        orientation: 'portrait',
        hotfixes: ['px_scaling'],
        compress: true,
      })
      images.forEach((dataUrl, i) => {
        if (i > 0) doc.addPage()
        doc.addImage(dataUrl, 'JPEG', 0, 0, PAGE_W, PAGE_H)
      })
      doc.save(filename)
    } catch (err) {
      console.error('PDF export failed', err)
      error.value = true
    } finally {
      exporting.value = false
    }
  }

  return { exporting, error, exportPdf }
}
