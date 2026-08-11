'use client'

import Image from 'next/image'
import { Download, ImageIcon, LayoutGrid, Link2, Palette, Shapes } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

const previewTools = [
  { icon: Link2, label: 'Lien' },
  { icon: LayoutGrid, label: 'Modèles' },
  { icon: Palette, label: 'Couleurs' },
  { icon: Shapes, label: 'Forme' },
  { icon: ImageIcon, label: 'Logo' },
]

export function StudioPreview() {
  return (
    <div className="studio-showcase" aria-label="Aperçu du Studio Vinkora">
      <div className="showcase-topbar">
        <Image src="/brand/vinkora-symbol.png" alt="" width={600} height={600} />
        <span>Nouveau QR code</span>
        <div className="showcase-status"><span /> Aperçu en direct</div>
        <button type="button" tabIndex={-1}>
          <Download aria-hidden="true" />
          Exporter
        </button>
      </div>
      <div className="showcase-body">
        <div className="showcase-rail" aria-hidden="true">
          {previewTools.map(({ icon: Icon, label }, index) => (
            <span className={index === 2 ? 'is-active' : ''} key={label}>
              <Icon />
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="showcase-inspector">
          <p>Couleurs</p>
          <strong>Une identité qui vous ressemble</strong>
          <div className="preview-swatches" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="preview-setting">
            <span>Dégradé Vinkora</span>
            <i />
          </div>
          <div className="preview-setting">
            <span>Coins arrondis</span>
            <i className="is-on" />
          </div>
        </div>
        <div className="showcase-canvas">
          <div className="showcase-url">
            <Link2 aria-hidden="true" />
            vinkora.app/mon-lien
          </div>
          <div className="preview-qr">
            <QRCodeSVG
              value="https://vinkora.app/studio"
              size={220}
              bgColor="#ffffff"
              fgColor="#0B1220"
              level="H"
              marginSize={2}
              title="QR code de démonstration Vinkora"
              imageSettings={{
                src: '/brand/vinkora-symbol.png',
                width: 42,
                height: 42,
                excavate: true,
              }}
            />
          </div>
          <div className="preview-reliability">
            <span aria-hidden="true" />
            Scan fiable
          </div>
        </div>
      </div>
    </div>
  )
}
