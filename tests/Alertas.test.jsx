
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alertas from '../src/pages/Alertas';
import { MockService } from '../src/services/MockService';

// Simulamos el servicio sin modificar el archivo original.
vi.mock('../src/services/MockService', () => ({
  MockService: {
    listarAlertas: vi.fn(),
  },
}));

// Datos de prueba independientes del mockData.json.
const alertasPrueba = [
  {
    id: 101,
    box: 'Box 1',
    fecha: '2026-10-07',
    hora: '09:30',
    categoria: 'RS',
    nivel: 'Alto',
    supervisor: 'supervisor1@psicocam.cl',
    estado_evaluacion: null,
  },
  {
    id: 102,
    box: 'Box 3',
    fecha: '2026-10-07',
    hora: '10:15',
    categoria: 'VD',
    nivel: 'Medio',
    supervisor: 'supervisor2@psicocam.cl',
    estado_evaluacion: null,
  },
  {
    id: 103,
    box: 'Box 5',
    fecha: '2026-10-07',
    hora: '11:00',
    categoria: 'RS',
    nivel: 'Bajo',
    supervisor: 'supervisor3@psicocam.cl',
    estado_evaluacion: 'correcta',
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  MockService.listarAlertas.mockResolvedValue(
    alertasPrueba.map((alerta) => ({ ...alerta }))
  );
});

describe('SCRUM-602 - Página Alertas', () => {
  it('muestra solamente las alertas pendientes', async () => {
    render(<Alertas />);

    expect(
      await screen.findByText('supervisor1@psicocam.cl')
    ).toBeTruthy();

    expect(
      screen.getByText('supervisor2@psicocam.cl')
    ).toBeTruthy();

    expect(
      screen.queryByText('supervisor3@psicocam.cl')
    ).toBeNull();

    expect(
      screen.getByText('2 alertas pendientes de evaluación')
    ).toBeTruthy();
  });

  it('filtra las alertas por categoría', async () => {
    const usuario = userEvent.setup();

    render(<Alertas />);

    await screen.findByText('supervisor1@psicocam.cl');

    await usuario.selectOptions(
      screen.getByLabelText('Categoría'),
      'VD'
    );

    expect(
      screen.getByText('supervisor2@psicocam.cl')
    ).toBeTruthy();

    expect(
      screen.queryByText('supervisor1@psicocam.cl')
    ).toBeNull();
  });

  it('filtra las alertas por nivel', async () => {
    const usuario = userEvent.setup();

    render(<Alertas />);

    await screen.findByText('supervisor1@psicocam.cl');

    await usuario.selectOptions(
      screen.getByLabelText('Nivel'),
      'Alto'
    );

    expect(
      screen.getByText('supervisor1@psicocam.cl')
    ).toBeTruthy();

    expect(
      screen.queryByText('supervisor2@psicocam.cl')
    ).toBeNull();
  });

  it('permite buscar alertas por supervisor', async () => {
    const usuario = userEvent.setup();

    render(<Alertas />);

    await screen.findByText('supervisor1@psicocam.cl');

    await usuario.type(
      screen.getByPlaceholderText('Box o supervisor...'),
      'supervisor2'
    );

    expect(
      screen.getByText('supervisor2@psicocam.cl')
    ).toBeTruthy();

    expect(
      screen.queryByText('supervisor1@psicocam.cl')
    ).toBeNull();
  });

  it('abre el detalle de una alerta pendiente', async () => {
    const usuario = userEvent.setup();

    render(<Alertas />);

    const supervisor = await screen.findByText(
      'supervisor1@psicocam.cl'
    );

    await usuario.click(supervisor);

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('clasifica una alerta y la elimina del listado de pendientes', async () => {
    const usuario = userEvent.setup();

    render(<Alertas />);

    // Esperamos que aparezca una alerta pendiente.
    const supervisor = await screen.findByText(
      'supervisor1@psicocam.cl'
    );

    // Abrimos el detalle de la alerta.
    await usuario.click(supervisor);

    const modal = screen.getByRole('dialog');

    // Seleccionamos la clasificación "Correcta".
    await usuario.click(
      within(modal).getByRole('radio', { name: /correcta/i })
    );

    // Guardamos la clasificación.
    await usuario.click(
      within(modal).getByRole('button', { name: /guardar/i })
    );

    // La alerta clasificada debe desaparecer.
    expect(
      screen.queryByText('supervisor1@psicocam.cl')
    ).toBeNull();

    // La otra alerta pendiente debe mantenerse.
    expect(
      screen.getByText('supervisor2@psicocam.cl')
    ).toBeTruthy();

    // El contador debe actualizarse.
    expect(
      screen.getByText('1 alertas pendientes de evaluación')
    ).toBeTruthy();
  });
});
