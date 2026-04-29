import "reflect-metadata";
import {
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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
  settings_json!: Record<string, unknown>;

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
  medical_history_json!: Record<string, unknown>;

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

  @Column({ type: "text", nullable: true })
  google_event_id!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// ==========================================
// Configuración del DataSource optimizado
// ==========================================

type GlobalWithTypeORM = typeof globalThis & {
  plexusDataSource?: DataSource;
  plexusDataSourceInitializing?: Promise<DataSource>;
};

const globalForTypeORM = globalThis as GlobalWithTypeORM;

const getPostgresUrl = () => {
  const postgresUrl = process.env.POSTGRES_URL;

  if (!postgresUrl) {
    throw new Error("POSTGRES_URL is required to initialize the database connection.");
  }

  return postgresUrl;
};

const createDataSource = () =>
  new DataSource({
    type: "postgres",
    url: getPostgresUrl(),
    extra: {
      max: Number(process.env.POSTGRES_POOL_MAX ?? 5),
      idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_TIMEOUT_MS ?? 10_000),
      connectionTimeoutMillis: Number(process.env.POSTGRES_CONNECTION_TIMEOUT_MS ?? 5_000),
      allowExitOnIdle: true,
    },
    synchronize: false,
    logging: process.env.NODE_ENV !== "production",
    entities: [OrganizationEntity, UserEntity, PatientEntity, AppointmentEntity],
    migrations: [],
    subscribers: [],
  });

export const getDataSource = async () => {
  if (globalForTypeORM.plexusDataSource?.isInitialized) {
    return globalForTypeORM.plexusDataSource;
  }

  if (!globalForTypeORM.plexusDataSource) {
    globalForTypeORM.plexusDataSource = createDataSource();
  }

  if (!globalForTypeORM.plexusDataSourceInitializing) {
    globalForTypeORM.plexusDataSourceInitializing = globalForTypeORM.plexusDataSource.initialize();
  }

  try {
    return await globalForTypeORM.plexusDataSourceInitializing;
  } finally {
    globalForTypeORM.plexusDataSourceInitializing = undefined;
  }
};
