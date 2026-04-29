import "reflect-metadata";
import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";

// ==========================================
// Entidades Básicas (Refactorización TypeORM)
// ==========================================

@Entity("Organization")
export class OrganizationEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  stripe_connect_id!: string | null;

  @Column({ type: "jsonb", default: "{}" })
  settings_json!: any;

  @Column({ type: "int", default: 0 })
  ai_usage_count!: number;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => UserEntity, user => user.organization)
  users!: UserEntity[];
}

@Entity("User")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text", default: "DOCTOR" })
  role!: string;

  @Column({ type: "text" })
  organization_id!: string;

  @ManyToOne(() => OrganizationEntity, org => org.users, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: OrganizationEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("Patient")
export class PatientEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  organization_id!: string;

  @Column({ type: "text" })
  full_name!: string;

  @Column({ type: "text", nullable: true })
  curp!: string | null;

  @Column({ type: "timestamp", nullable: true })
  birth_date!: Date | null;

  @Column({ type: "jsonb", default: "{}" })
  medical_history_json!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("Appointment")
export class AppointmentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  organization_id!: string;

  @Column({ type: "text" })
  doctor_id!: string;

  @Column({ type: "text" })
  patient_id!: string;

  @Column({ type: "timestamp" })
  start_time!: Date;

  @Column({ type: "text", default: "SCHEDULED" })
  status!: string;

  @Column({ type: "text", default: "PENDING" })
  payment_status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// ==========================================
// Configuración del DataSource optimizado
// ==========================================

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // Para conexión Pooling en Supabase / Vercel (si se usa Supavisor / PgBouncer)
  extra: {
    max: 20,          // Max size of the connection pool
    connectionTimeoutMillis: 5000,
  },
  synchronize: false, // ¡IMPORTANTE! Mantener compatibilidad con Prisma
  logging: process.env.NODE_ENV !== "production",
  entities: [OrganizationEntity, UserEntity, PatientEntity, AppointmentEntity],
  migrations: [],
  subscribers: [],
});

export const getDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};
