export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      amortizaciones: {
        Row: {
          capital: number
          contrato_id: string
          created_at: string | null
          estado: string | null
          fecha_corte: string
          fecha_pago_real: string | null
          id: string
          interes: number
          numero_pago: number
          penalizacion: number
          total: number
        }
        Insert: {
          capital: number
          contrato_id: string
          created_at?: string | null
          estado?: string | null
          fecha_corte: string
          fecha_pago_real?: string | null
          id?: string
          interes?: number
          numero_pago: number
          penalizacion?: number
          total: number
        }
        Update: {
          capital?: number
          contrato_id?: string
          created_at?: string | null
          estado?: string | null
          fecha_corte?: string
          fecha_pago_real?: string | null
          id?: string
          interes?: number
          numero_pago?: number
          penalizacion?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "amortizaciones_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accion: string
          campo: string | null
          created_at: string | null
          id: string
          registro_id: string
          tabla: string
          usuario_id: string | null
          valor_anterior: Json | null
          valor_nuevo: Json | null
        }
        Insert: {
          accion: string
          campo?: string | null
          created_at?: string | null
          id?: string
          registro_id: string
          tabla: string
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Update: {
          accion?: string
          campo?: string | null
          created_at?: string | null
          id?: string
          registro_id?: string
          tabla?: string
          usuario_id?: string | null
          valor_anterior?: Json | null
          valor_nuevo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          apellidos: string
          ciudad: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          rfc: string | null
          telefono: string | null
          user_id: string | null
        }
        Insert: {
          apellidos: string
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          rfc?: string | null
          telefono?: string | null
          user_id?: string | null
        }
        Update: {
          apellidos?: string
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          rfc?: string | null
          telefono?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string
          created_at: string | null
          enganche: number | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          monto_total: number
          notas: string | null
          plazo_meses: number | null
          propiedad_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          enganche?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          monto_total: number
          notas?: string | null
          plazo_meses?: number | null
          propiedad_id: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          enganche?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          monto_total?: number
          notas?: string | null
          plazo_meses?: number | null
          propiedad_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      interacciones: {
        Row: {
          created_at: string | null
          id: string
          notas: string | null
          prospecto_id: string
          realizado_por: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notas?: string | null
          prospecto_id: string
          realizado_por?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notas?: string | null
          prospecto_id?: string
          realizado_por?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "interacciones_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacciones_realizado_por_fkey"
            columns: ["realizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_contables: {
        Row: {
          categoria: string
          cfdi_estado: string | null
          cfdi_motivo_cancelacion: string | null
          cfdi_uuid: string | null
          created_at: string | null
          descripcion: string | null
          fecha: string
          id: string
          monto: number
          proyecto_id: string | null
          referencia: string | null
          tipo: string
        }
        Insert: {
          categoria: string
          cfdi_estado?: string | null
          cfdi_motivo_cancelacion?: string | null
          cfdi_uuid?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha: string
          id?: string
          monto: number
          proyecto_id?: string | null
          referencia?: string | null
          tipo: string
        }
        Update: {
          categoria?: string
          cfdi_estado?: string | null
          cfdi_motivo_cancelacion?: string | null
          cfdi_uuid?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha?: string
          id?: string
          monto?: number
          proyecto_id?: string | null
          referencia?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_contables_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          amortizacion_id: string | null
          cliente_id: string
          contrato_id: string
          created_at: string | null
          fecha: string
          id: string
          metodo_pago: string | null
          monto: number
          referencia: string | null
          registrado_por: string | null
        }
        Insert: {
          amortizacion_id?: string | null
          cliente_id: string
          contrato_id: string
          created_at?: string | null
          fecha: string
          id?: string
          metodo_pago?: string | null
          monto: number
          referencia?: string | null
          registrado_por?: string | null
        }
        Update: {
          amortizacion_id?: string | null
          cliente_id?: string
          contrato_id?: string
          created_at?: string | null
          fecha?: string
          id?: string
          metodo_pago?: string | null
          monto?: number
          referencia?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_amortizacion_id_fkey"
            columns: ["amortizacion_id"]
            isOneToOne: false
            referencedRelation: "amortizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      penalizaciones: {
        Row: {
          amortizacion_id: string
          created_at: string | null
          fecha_aplicacion: string
          id: string
          monto: number
        }
        Insert: {
          amortizacion_id: string
          created_at?: string | null
          fecha_aplicacion: string
          id?: string
          monto?: number
        }
        Update: {
          amortizacion_id?: string
          created_at?: string | null
          fecha_aplicacion?: string
          id?: string
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "penalizaciones_amortizacion_id_fkey"
            columns: ["amortizacion_id"]
            isOneToOne: false
            referencedRelation: "amortizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          ciudad: string
          created_at: string | null
          descripcion: string | null
          direccion: string | null
          estado_disponibilidad: string | null
          galeria: string[] | null
          id: string
          imagen_url: string | null
          lote_id: string | null
          precio: number
          proyecto_id: string | null
          superficie_m2: number | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ciudad: string
          created_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          estado_disponibilidad?: string | null
          galeria?: string[] | null
          id?: string
          imagen_url?: string | null
          lote_id?: string | null
          precio: number
          proyecto_id?: string | null
          superficie_m2?: number | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ciudad?: string
          created_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          estado_disponibilidad?: string | null
          galeria?: string[] | null
          id?: string
          imagen_url?: string | null
          lote_id?: string | null
          precio?: number
          proyecto_id?: string | null
          superficie_m2?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prospectos: {
        Row: {
          asesor_id: string | null
          created_at: string | null
          email: string | null
          etapa: string | null
          fuente: string | null
          id: string
          interes: string | null
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          asesor_id?: string | null
          created_at?: string | null
          email?: string | null
          etapa?: string | null
          fuente?: string | null
          id?: string
          interes?: string | null
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          asesor_id?: string | null
          created_at?: string | null
          email?: string | null
          etapa?: string | null
          fuente?: string | null
          id?: string
          interes?: string | null
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_asesor_id_fkey"
            columns: ["asesor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      socios: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
          porcentaje_participacion: number
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
          porcentaje_participacion: number
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
          porcentaje_participacion?: number
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "socios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nombre: string
          rol: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      usuario_rol_actual: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

