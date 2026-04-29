import { MotorcycleTypeEnum } from '@/modules/motorcycle/domain/enums/motorcycle-type.enum';

interface DefaultTaskTemplate {
  name: string;
  description: string;
  intervalHours: number;
}

export const DEFAULT_TASKS: Record<MotorcycleTypeEnum, DefaultTaskTemplate[]> =
  {
    [MotorcycleTypeEnum.ENDURO]: [
      {
        name: 'Engine Oil Change',
        description: 'Replace engine oil',
        intervalHours: 15,
      },
      {
        name: 'Oil Filter Replacement',
        description: 'Replace oil filter',
        intervalHours: 15,
      },
      {
        name: 'Air Filter Cleaning',
        description: 'Clean or replace air filter',
        intervalHours: 10,
      },
      {
        name: 'Chain Lubrication',
        description: 'Lubricate drive chain',
        intervalHours: 5,
      },
      {
        name: 'Chain Tension Adjustment',
        description: 'Check and adjust chain tension',
        intervalHours: 10,
      },
      {
        name: 'Coolant Check',
        description: 'Check and replace coolant',
        intervalHours: 30,
      },
      {
        name: 'Brake Pads Check',
        description: 'Check and replace brake pads',
        intervalHours: 25,
      },
      {
        name: 'Brake Fluid Replacement',
        description: 'Replace brake fluid',
        intervalHours: 50,
      },
      {
        name: 'Fork Seal Inspection',
        description: 'Inspect fork seals for leaks',
        intervalHours: 40,
      },
      {
        name: 'Shock Absorber Service',
        description: 'Service rear shock absorber',
        intervalHours: 50,
      },
      {
        name: 'Spark Plug Replacement',
        description: 'Replace spark plug',
        intervalHours: 30,
      },
      {
        name: 'Valve Clearance Check',
        description: 'Check and adjust valve clearance',
        intervalHours: 30,
      },
    ],
  };
