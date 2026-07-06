export interface GrupoAseoType {
  id: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export interface EncargadoAVType {
  id: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export interface HistorialRolType {
  id: string;
  fechaInicioSemana: string;
  tipoReunion: "Jueves" | "Domingo";
  grupoAseo1: GrupoAseoType | null;
  grupoAseo2: GrupoAseoType | null;
  encargadoAV: EncargadoAVType | null;
  esPausaAsamblea: boolean;
  completado: boolean;
}
