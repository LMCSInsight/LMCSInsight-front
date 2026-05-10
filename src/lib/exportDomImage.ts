/**
 * Rasterize a DOM subtree to PNG (charts, cards). Uses html2canvas.
 * Recharts SVGs often use `fill: var(--chart-n)`; we resolve those in the clone
 * so rasterization is not blank. `foreignObjectRendering: false` avoids many
 * SVG/foreignObject failures in Chromium.
 *
 * Theme CSS may use `oklch()` / `oklab()` — html2canvas 1.4 cannot parse them.
 * We copy resolved `getComputedStyle` from the live tree, strip stylesheets,
 * then scrub any remaining modern color syntax on the clone.
 */
const H2C_EXPORT_ATTR = 'data-h2c-export'

/** html2canvas cannot parse these CSS Color 4/5 functions (even as strings). */
function hasUnsupportedColorFunction(value: string): boolean {
  return /(?:oklch|oklab|color-mix|lab|lch)\(/i.test(value)
}

function stripClonedStylesheets(doc: Document): number {
  let removed = 0
  doc.querySelectorAll('style').forEach((el) => {
    el.remove()
    removed++
  })
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
    el.remove()
    removed++
  })
  return removed
}

/** Remove any inline declaration or attribute that still contains oklch/oklab/etc. */
function scrubUnsupportedColorsInDocument(doc: Document): number {
  let removed = 0
  doc.querySelectorAll('*').forEach((node) => {
    if (node instanceof HTMLElement && node.style?.length) {
      const props: string[] = []
      for (let i = 0; i < node.style.length; i++) {
        props.push(node.style.item(i))
      }
      for (const prop of props) {
        const val = node.style.getPropertyValue(prop)
        if (val && hasUnsupportedColorFunction(val)) {
          node.style.removeProperty(prop)
          removed++
        }
      }
      for (const prop of [
        'background',
        'background-image',
        'filter',
        'backdrop-filter',
      ] as const) {
        const val = node.style.getPropertyValue(prop)
        if (val && hasUnsupportedColorFunction(val)) {
          node.style.removeProperty(prop)
          removed++
        }
      }
    }
    if (node instanceof Element) {
      for (const attr of [
        'fill',
        'stroke',
        'stop-color',
        'flood-color',
        'lighting-color',
        'color',
      ] as const) {
        const v = node.getAttribute(attr)
        if (v && hasUnsupportedColorFunction(v)) {
          node.removeAttribute(attr)
          removed++
        }
      }
      const styleAttr = node.getAttribute('style')
      if (styleAttr && hasUnsupportedColorFunction(styleAttr)) {
        const kept = styleAttr
          .split(';')
          .map((s) => s.trim())
          .filter((part) => part && !hasUnsupportedColorFunction(part))
        if (kept.length) node.setAttribute('style', kept.join('; '))
        else node.removeAttribute('style')
        removed++
      }
    }
  })
  return removed
}

/** Pair-walk orig (live DOM) and clone; copy resolved colors so clone has no oklch left in cascade. */
function inlineLiveComputedColors(orig: Element, clone: Element): void {
  if (orig instanceof HTMLElement && clone instanceof HTMLElement) {
    const cs = window.getComputedStyle(orig)
    const keys: (keyof CSSStyleDeclaration)[] = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'textDecorationColor',
      'columnRuleColor',
      'caretColor',
    ]
    for (const key of keys) {
      const val = cs[key]
      if (
        typeof val === 'string' &&
        val &&
        val !== 'rgba(0, 0, 0, 0)' &&
        !hasUnsupportedColorFunction(val)
      ) {
        try {
          ;(clone.style as unknown as Record<string, string>)[key as string] =
            val
        } catch {
          /* ignore invalid assignments */
        }
      }
    }
    const shadow = cs.boxShadow
    if (shadow && shadow !== 'none' && !hasUnsupportedColorFunction(shadow)) {
      try {
        clone.style.boxShadow = shadow
      } catch {
        /* ignore */
      }
    }
  }
  if (orig instanceof SVGElement && clone instanceof SVGElement) {
    const cs = window.getComputedStyle(orig as unknown as Element)
    const fill = cs.fill
    const stroke = cs.stroke
    if (fill && fill !== 'none' && !hasUnsupportedColorFunction(fill))
      clone.setAttribute('fill', fill)
    if (stroke && stroke !== 'none' && !hasUnsupportedColorFunction(stroke))
      clone.setAttribute('stroke', stroke)
  }
  const oc = orig.children
  const cc = clone.children
  for (let i = 0; i < Math.min(oc.length, cc.length); i++) {
    inlineLiveComputedColors(oc[i], cc[i])
  }
}

export async function downloadDomAsPng(
  element: HTMLElement | null,
  filename: string,
): Promise<void> {
  if (!element) {
    throw new Error('Missing element')
  }
  const html2canvas = (await import('html2canvas')).default

  await document.fonts?.ready?.catch(() => undefined)

  const rect = element.getBoundingClientRect()
  const w = Math.max(320, Math.ceil(rect.width), element.scrollWidth)
  const h = Math.max(240, Math.ceil(rect.height), element.scrollHeight)

  element.setAttribute(H2C_EXPORT_ATTR, '1')

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      width: w,
      height: h,
      windowWidth: w,
      windowHeight: h,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const cloneRoot = clonedDoc.querySelector(
          `[${H2C_EXPORT_ATTR}]`,
        ) as HTMLElement | null
        if (cloneRoot) {
          inlineLiveComputedColors(element, cloneRoot)
        }
        stripClonedStylesheets(clonedDoc)

        const win = clonedDoc.defaultView
        if (!win) return
        clonedDoc.querySelectorAll('svg, svg *').forEach((node) => {
          if (!(node instanceof Element)) return
          const cs = win.getComputedStyle(node)
          const fillAttr = node.getAttribute('fill')
          if (fillAttr?.includes('var(') || fillAttr === 'currentColor') {
            const v = cs.fill
            if (v && v !== 'none' && !hasUnsupportedColorFunction(v))
              node.setAttribute('fill', v)
          }
          const strokeAttr = node.getAttribute('stroke')
          if (strokeAttr?.includes('var(')) {
            const v = cs.stroke
            if (v && v !== 'none' && !hasUnsupportedColorFunction(v))
              node.setAttribute('stroke', v)
          }
          if (node instanceof HTMLElement) {
            const c = cs.color
            if (c && !hasUnsupportedColorFunction(c)) node.style.color = c
          }
        })

        scrubUnsupportedColorsInDocument(clonedDoc)
      },
    })
  } finally {
    element.removeAttribute(H2C_EXPORT_ATTR)
  }

  const url = canvas.toDataURL('image/png')

  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
