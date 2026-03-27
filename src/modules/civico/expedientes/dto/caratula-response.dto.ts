
export class CaratulaDto {
    // Del expediente
    expedienteId!: string;
    folioExpediente!: string;
    causaPenal!: string;
    aliasSobrenombre!: string | null;
    numJuzgadoCivico!: string | null;
    delitoImputado!: string | null;
    agraviado!: string | null;
    modalidadFalta!: string | null;
    estatusProceso!: string;
    horasSentencia!: number;
  
    // Del beneficiario (JOIN)
    nombre!: string;
    fechaIngreso!: Date;
    tiempoAsignado!: number;
    beneficiarioId!: number;
  }