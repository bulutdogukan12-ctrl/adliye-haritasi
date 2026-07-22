import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import 'leaflet/dist/leaflet.css'
import { V2App } from './v2/V2App'

registerSW({ immediate: true })

const root = createRoot(document.getElementById('root')!)
root.render(<StrictMode><V2App /></StrictMode>)
