import type MapService from '@/services/map-service'
import type { GeoData, MapRenderer } from '@/types/service.types'

export type { GeoData, MapRenderer }

export interface MapServiceEntry {
  id: string
  service: MapService
  renderer: MapRenderer
}

export class MapRegistry {
  private services = new Map<string, MapServiceEntry>()

  register(id: string, service: MapService, renderer: MapRenderer) {
    this.services.set(id, { id, service, renderer })
  }

  get(id: string): MapServiceEntry | undefined {
    return this.services.get(id)
  }

  getAll(): MapServiceEntry[] {
    return Array.from(this.services.values())
  }

  getIds(): string[] {
    return Array.from(this.services.keys())
  }
}
