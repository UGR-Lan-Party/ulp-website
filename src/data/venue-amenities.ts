import type { VenuePlanId } from './venue-map';
export type VenueAmenityKind =
  'stairs' | 'lift' | 'entry' | 'men' | 'women' | 'accessible' | 'wc';
export interface VenueAmenity {
  kind: VenueAmenityKind;
  label: string;
  x: number;
  y: number;
}
export const venueAmenities: Partial<Record<VenuePlanId, VenueAmenity[]>> = {
  'principal-0': [
    { kind: 'men', label: 'Aseo de hombres', x: 184, y: 84 },
    { kind: 'women', label: 'Aseo de mujeres', x: 225, y: 148 },
    { kind: 'accessible', label: 'Aseo adaptado', x: 234, y: 48 },
    { kind: 'stairs', label: 'Escaleras', x: 217, y: 282 },
    { kind: 'lift', label: 'Ascensor', x: 273, y: 284 },
    {
      kind: 'entry',
      label: 'Salida auxiliar del Salón de Grados · Cerrada durante la ULP',
      x: 200,
      y: 910,
    },
  ],
  'principal-baja': [
    { kind: 'stairs', label: 'Escaleras', x: 217, y: 282 },
    { kind: 'lift', label: 'Ascensor', x: 273, y: 284 },
  ],
  'aulas-inferiores': [
    { kind: 'entry', label: 'Entrada al aula −1.1', x: 552, y: 606 },
    { kind: 'entry', label: 'Entrada al aula −1.2', x: 880, y: 683 },
  ],
  'prefabricadas-a': [
    { kind: 'entry', label: 'Acceso A1', x: 170, y: 585 },
    { kind: 'entry', label: 'Acceso A2', x: 680, y: 585 },
  ],
  'prefabricadas-b': [{ kind: 'entry', label: 'Acceso B1', x: 368, y: 585 }],
};
