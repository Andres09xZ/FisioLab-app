/**
 * ==========================================
 * PRUEBAS UNITARIAS - RECETAS MÉDICAS
 * ==========================================
 * Pruebas de validación y lógica de negocio
 * 
 * Ejecutar con: node backend/api/src/tests/recetas.test.js
 */

import assert from 'assert';

// ====== HELPERS PARA PRUEBAS ======
const generateCodigoReceta = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `RX-${timestamp}-${random}`;
};

const calcularFechaVencimiento = (vigenciaDias = 30) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + vigenciaDias);
  return fecha.toISOString().split('T')[0];
};

const validarMedicamentos = (medicamentos) => {
  if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
    return { valid: false, message: 'Debe incluir al menos un medicamento' };
  }

  const camposRequeridos = ['nombre', 'presentacion', 'dosis', 'duracion', 'via_administracion'];
  
  for (let i = 0; i < medicamentos.length; i++) {
    const med = medicamentos[i];
    for (const campo of camposRequeridos) {
      if (!med[campo] || med[campo].trim() === '') {
        return {
          valid: false,
          message: `Medicamento ${i + 1}: campo "${campo}" es requerido`
        };
      }
    }
  }

  return { valid: true };
};

// ====== PRUEBAS ======

console.log('🧪 Iniciando pruebas de Recetas Médicas...\n');

// TEST 1: Generar código de receta
console.log('✓ TEST 1: Generar código de receta');
try {
  const codigo1 = generateCodigoReceta();
  const codigo2 = generateCodigoReceta();
  
  assert(codigo1.startsWith('RX-'), 'El código debe comenzar con RX-');
  assert(codigo1 !== codigo2, 'Los códigos deben ser únicos');
  assert(codigo1.length > 10, 'El código debe tener longitud suficiente');
  
  console.log(`  ✅ Código generado: ${codigo1}\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 2: Calcular fecha de vencimiento
console.log('✓ TEST 2: Calcular fecha de vencimiento');
try {
  const fecha = calcularFechaVencimiento(30);
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  
  assert(fechaObj > hoy, 'La fecha de vencimiento debe ser futura');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(fecha), 'El formato debe ser YYYY-MM-DD');
  
  // Verificar que es aproximadamente 30 días en el futuro (con tolerancia de +/- 1 día)
  const diferenciaDias = Math.round((fechaObj - hoy) / (1000 * 60 * 60 * 24));
  assert(diferenciaDias >= 29 && diferenciaDias <= 31, `Debe ser aproximadamente 30 días, fue ${diferenciaDias}`);
  
  console.log(`  ✅ Fecha calculada: ${fecha} (${diferenciaDias} días)\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 3: Validar medicamentos - Caso exitoso
console.log('✓ TEST 3: Validar medicamentos - Caso exitoso');
try {
  const medicamentos = [
    {
      nombre: 'Ibuprofeno 600mg',
      presentacion: 'Tabletas',
      dosis: '1 tableta cada 8 horas',
      duracion: '7 días',
      via_administracion: 'Oral',
      indicaciones: 'Tomar con alimentos'
    },
    {
      nombre: 'Paracetamol 500mg',
      presentacion: 'Tabletas',
      dosis: '1 tableta cada 6 horas',
      duracion: '5 días',
      via_administracion: 'Oral',
      indicaciones: 'En caso de fiebre'
    }
  ];
  
  const resultado = validarMedicamentos(medicamentos);
  assert(resultado.valid === true, 'La validación debe ser exitosa');
  
  console.log(`  ✅ Medicamentos válidos: ${medicamentos.length} medicamentos\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 4: Validar medicamentos - Array vacío
console.log('✓ TEST 4: Validar medicamentos - Array vacío');
try {
  const medicamentos = [];
  const resultado = validarMedicamentos(medicamentos);
  
  assert(resultado.valid === false, 'Debe fallar con array vacío');
  assert(resultado.message.includes('al menos un medicamento'), 'Mensaje correcto');
  
  console.log(`  ✅ Validación correcta: ${resultado.message}\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 5: Validar medicamentos - Campo faltante
console.log('✓ TEST 5: Validar medicamentos - Campo faltante');
try {
  const medicamentos = [
    {
      nombre: 'Ibuprofeno 600mg',
      presentacion: 'Tabletas',
      // falta 'dosis'
      duracion: '7 días',
      via_administracion: 'Oral'
    }
  ];
  
  const resultado = validarMedicamentos(medicamentos);
  
  assert(resultado.valid === false, 'Debe fallar con campo faltante');
  assert(resultado.message.includes('dosis'), 'Debe indicar el campo faltante');
  
  console.log(`  ✅ Validación correcta: ${resultado.message}\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 6: Validar medicamentos - Campo vacío
console.log('✓ TEST 6: Validar medicamentos - Campo vacío');
try {
  const medicamentos = [
    {
      nombre: 'Ibuprofeno 600mg',
      presentacion: '',  // campo vacío
      dosis: '1 tableta cada 8 horas',
      duracion: '7 días',
      via_administracion: 'Oral'
    }
  ];
  
  const resultado = validarMedicamentos(medicamentos);
  
  assert(resultado.valid === false, 'Debe fallar con campo vacío');
  assert(resultado.message.includes('presentacion'), 'Debe indicar el campo vacío');
  
  console.log(`  ✅ Validación correcta: ${resultado.message}\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 7: Validar medicamentos - Múltiples medicamentos con error
console.log('✓ TEST 7: Validar medicamentos - Múltiples medicamentos con error');
try {
  const medicamentos = [
    {
      nombre: 'Ibuprofeno 600mg',
      presentacion: 'Tabletas',
      dosis: '1 tableta cada 8 horas',
      duracion: '7 días',
      via_administracion: 'Oral'
    },
    {
      nombre: 'Paracetamol 500mg',
      // falta 'presentacion'
      dosis: '1 tableta cada 6 horas',
      duracion: '5 días',
      via_administracion: 'Oral'
    }
  ];
  
  const resultado = validarMedicamentos(medicamentos);
  
  assert(resultado.valid === false, 'Debe fallar con medicamento incompleto');
  assert(resultado.message.includes('Medicamento 2'), 'Debe indicar cuál medicamento tiene error');
  
  console.log(`  ✅ Validación correcta: ${resultado.message}\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 8: Formato de estructura de medicamento
console.log('✓ TEST 8: Formato de estructura de medicamento');
try {
  const medicamento = {
    nombre: 'Diclofenaco 75mg',
    presentacion: 'Ampolla',
    dosis: '1 ampolla cada 12 horas',
    duracion: '3 días',
    via_administracion: 'Intramuscular',
    indicaciones: 'Aplicar profundo vía IM'
  };
  
  const camposEsperados = ['nombre', 'presentacion', 'dosis', 'duracion', 'via_administracion', 'indicaciones'];
  const camposActuales = Object.keys(medicamento);
  
  for (const campo of camposEsperados) {
    assert(camposActuales.includes(campo), `Debe incluir campo ${campo}`);
  }
  
  console.log(`  ✅ Estructura correcta con ${camposActuales.length} campos\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 9: Validar vigencia personalizada
console.log('✓ TEST 9: Validar vigencia personalizada');
try {
  const fecha7dias = calcularFechaVencimiento(7);
  const fecha60dias = calcularFechaVencimiento(60);
  const fecha90dias = calcularFechaVencimiento(90);
  
  const hoy = new Date();
  const fecha7Obj = new Date(fecha7dias);
  const fecha60Obj = new Date(fecha60dias);
  const fecha90Obj = new Date(fecha90dias);
  
  const diff7 = Math.round((fecha7Obj - hoy) / (1000 * 60 * 60 * 24));
  const diff60 = Math.round((fecha60Obj - hoy) / (1000 * 60 * 60 * 24));
  const diff90 = Math.round((fecha90Obj - hoy) / (1000 * 60 * 60 * 24));
  
  assert(diff7 >= 6 && diff7 <= 8, `Vigencia de 7 días (fue ${diff7})`);
  assert(diff60 >= 59 && diff60 <= 61, `Vigencia de 60 días (fue ${diff60})`);
  assert(diff90 >= 89 && diff90 <= 91, `Vigencia de 90 días (fue ${diff90})`);
  
  console.log(`  ✅ Vigencias validadas: ${diff7}, ${diff60} y ${diff90} días\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

// TEST 10: Validar estructura JSON completa
console.log('✓ TEST 10: Validar estructura JSON de receta');
try {
  const recetaMock = {
    historia_clinica_id: 'uuid-123',
    paciente_id: 'uuid-456',
    paciente_nombre_completo: 'Juan Pérez García',
    paciente_documento: '12345678',
    paciente_edad: 45,
    paciente_sexo: 'M',
    medicamentos: [
      {
        nombre: 'Ibuprofeno 600mg',
        presentacion: 'Tabletas',
        dosis: '1 tableta cada 8 horas',
        duracion: '7 días',
        via_administracion: 'Oral',
        indicaciones: 'Tomar con alimentos'
      }
    ],
    diagnostico_principal: 'Esguince de tobillo grado II',
    indicaciones_generales: 'Reposo relativo, aplicar hielo local',
    recomendaciones: 'Elevar pierna, evitar apoyo completo',
    vigencia_dias: 30
  };
  
  // Validar que tiene todos los campos necesarios
  assert(recetaMock.paciente_id, 'Debe tener paciente_id');
  assert(recetaMock.diagnostico_principal, 'Debe tener diagnóstico');
  assert(Array.isArray(recetaMock.medicamentos), 'medicamentos debe ser array');
  assert(recetaMock.medicamentos.length > 0, 'Debe tener al menos un medicamento');
  
  // Validar medicamentos
  const validacion = validarMedicamentos(recetaMock.medicamentos);
  assert(validacion.valid === true, 'Medicamentos deben ser válidos');
  
  console.log(`  ✅ Estructura completa de receta validada\n`);
} catch (error) {
  console.log(`  ❌ Error: ${error.message}\n`);
  process.exit(1);
}

console.log('='.repeat(50));
console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
console.log('='.repeat(50));
console.log(`\nTotal de pruebas: 10`);
console.log('Estado: ✅ PASS\n');
