/**
 * Script de prueba para API de Recetas Médicas
 * Ejecutar: node test-recetas-api.js
 */

import http from 'http';

const API_BASE = 'http://localhost:3001/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      log('green', `✅ ${method} ${endpoint} - SUCCESS`);
      return { success: true, data: result, status: response.status };
    } else {
      log('red', `❌ ${method} ${endpoint} - ERROR ${response.status}`);
      console.log('   Response:', result);
      return { success: false, data: result, status: response.status };
    }
  } catch (error) {
    log('red', `❌ ${method} ${endpoint} - FETCH ERROR`);
    console.log('   Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('cyan', '\n🧪 INICIANDO PRUEBAS DE API - RECETAS MÉDICAS\n');
  log('cyan', '='.repeat(60) + '\n');

  let token = null;
  let pacienteId = null;
  let historiaClinicaId = null;
  let recetaId = null;

  // TEST 1: Health Check
  log('blue', '📋 TEST 1: Health Check');
  await testEndpoint('GET', '/health');
  console.log();

  // TEST 2: Registrar usuario de prueba
  log('blue', '📋 TEST 2: Registrar usuario de prueba (DOCTOR)');
  const registerData = {
    email: `doctor.test.${Date.now()}@fisiolab.com`,
    password: 'Test123!',
    nombre: 'Doctor',
    apellido: 'Test',
    rol: 'DOCTOR'
  };
  
  const registerResult = await testEndpoint('POST', '/auth/register', registerData);
  console.log();

  // TEST 3: Login
  log('blue', '📋 TEST 3: Login con usuario de prueba');
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };
  
  const loginResult = await testEndpoint('POST', '/auth/login', loginData);
  
  if (loginResult.success && loginResult.data.token) {
    token = loginResult.data.token;
    log('green', `   Token obtenido: ${token.substring(0, 30)}...`);
  } else {
    log('red', '   ⚠️ No se pudo obtener token, usando usuario existente...');
    
    // Intentar con usuario existente
    const loginExisting = await testEndpoint('POST', '/auth/login', {
      email: 'juan@gmail.com',
      password: 'password123' // Cambiar si conoces la contraseña real
    });
    
    if (loginExisting.success && loginExisting.data.token) {
      token = loginExisting.data.token;
      log('green', `   Token obtenido: ${token.substring(0, 30)}...`);
    }
  }
  console.log();

  if (!token) {
    log('red', '❌ No se pudo obtener token. Deteniendo pruebas.');
    return;
  }

  // TEST 4: Obtener pacientes
  log('blue', '📋 TEST 4: Obtener lista de pacientes');
  const pacientesResult = await testEndpoint('GET', '/pacientes', null, token);
  
  if (pacientesResult.success && pacientesResult.data.data && pacientesResult.data.data.length > 0) {
    pacienteId = pacientesResult.data.data[0].id;
    log('green', `   Paciente ID obtenido: ${pacienteId}`);
    log('green', `   Nombre: ${pacientesResult.data.data[0].nombres} ${pacientesResult.data.data[0].apellidos}`);
  }
  console.log();

  // TEST 5: Obtener historias clínicas
  log('blue', '📋 TEST 5: Obtener historias clínicas');
  const hcResult = await testEndpoint('GET', '/historias-clinicas', null, token);
  
  if (hcResult.success && hcResult.data.data && hcResult.data.data.length > 0) {
    // Buscar una HC traumatológica del doctor
    const hcTraumatologica = hcResult.data.data.find(hc => hc.tipo_historia === 'traumatologica');
    if (hcTraumatologica) {
      historiaClinicaId = hcTraumatologica.id;
      log('green', `   Historia Clínica ID obtenida: ${historiaClinicaId}`);
    }
  }
  console.log();

  if (!pacienteId) {
    log('yellow', '⚠️ No hay pacientes en la BD. No se pueden probar recetas.');
    return;
  }

  // TEST 6: Crear receta (sin HC)
  log('blue', '📋 TEST 6: Crear receta rápida (sin HC)');
  const recetaData = {
    paciente_id: pacienteId,
    diagnostico_principal: 'Esguince de tobillo grado II',
    medicamentos: [
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
        dosis: '1 tableta cada 6 horas si hay fiebre',
        duracion: '5 días',
        via_administracion: 'Oral',
        indicaciones: 'Solo en caso de fiebre mayor a 38°C'
      }
    ],
    indicaciones_generales: 'Reposo relativo durante 7 días. Evitar apoyo completo sobre el pie afectado.',
    recomendaciones: 'Aplicar hielo local 15-20 minutos, 3 veces al día. Elevar la pierna. Usar vendaje compresivo.',
    vigencia_dias: 30,
    numero_registro_medico: '12345-BOL'
  };

  const createRecetaResult = await testEndpoint('POST', '/recetas', recetaData, token);
  
  if (createRecetaResult.success && createRecetaResult.data.data) {
    recetaId = createRecetaResult.data.data.id;
    log('green', `   ✅ Receta creada exitosamente!`);
    log('green', `   ID: ${recetaId}`);
    log('green', `   Código: ${createRecetaResult.data.data.codigo_receta}`);
    log('green', `   Fecha emisión: ${createRecetaResult.data.data.fecha_emision}`);
    log('green', `   Fecha vencimiento: ${createRecetaResult.data.data.fecha_vencimiento}`);
  }
  console.log();

  if (!recetaId) {
    log('yellow', '⚠️ No se pudo crear receta. Deteniendo pruebas.');
    return;
  }

  // TEST 7: Listar recetas
  log('blue', '📋 TEST 7: Listar todas las recetas del doctor');
  const listRecetasResult = await testEndpoint('GET', '/recetas', null, token);
  
  if (listRecetasResult.success && listRecetasResult.data.data) {
    log('green', `   Total de recetas: ${listRecetasResult.data.data.length}`);
    log('green', `   Páginas: ${listRecetasResult.data.pagination.pages}`);
  }
  console.log();

  // TEST 8: Ver receta específica
  log('blue', '📋 TEST 8: Ver detalle de receta');
  const viewRecetaResult = await testEndpoint('GET', `/recetas/${recetaId}`, null, token);
  
  if (viewRecetaResult.success && viewRecetaResult.data.data) {
    log('green', `   Código: ${viewRecetaResult.data.data.codigo_receta}`);
    log('green', `   Paciente: ${viewRecetaResult.data.data.paciente_nombre_completo}`);
    log('green', `   Diagnóstico: ${viewRecetaResult.data.data.diagnostico_principal}`);
    log('green', `   Medicamentos: ${viewRecetaResult.data.data.medicamentos.length}`);
    log('green', `   Estado: ${viewRecetaResult.data.data.estado}`);
  }
  console.log();

  // TEST 9: Listar recetas activas
  log('blue', '📋 TEST 9: Filtrar recetas activas');
  await testEndpoint('GET', '/recetas?status=activa', null, token);
  console.log();

  // TEST 10: Actualizar receta
  log('blue', '📋 TEST 10: Actualizar receta');
  const updateData = {
    indicaciones_generales: 'ACTUALIZADO: Reposo absoluto durante 10 días',
    recomendaciones: 'ACTUALIZADO: Fisioterapia después de 7 días'
  };
  await testEndpoint('PATCH', `/recetas/${recetaId}`, updateData, token);
  console.log();

  // TEST 11: Duplicar receta
  log('blue', '📋 TEST 11: Duplicar receta');
  const duplicateResult = await testEndpoint('POST', `/recetas/${recetaId}/duplicate`, null, token);
  
  if (duplicateResult.success && duplicateResult.data.data) {
    log('green', `   Nueva receta duplicada con código: ${duplicateResult.data.data.codigo_receta}`);
  }
  console.log();

  // TEST 12: Obtener PDF (placeholder)
  log('blue', '📋 TEST 12: Obtener PDF de receta');
  await testEndpoint('GET', `/recetas/${recetaId}/pdf`, null, token);
  console.log();

  // TEST 13: Si hay HC, obtener datos para receta
  if (historiaClinicaId) {
    log('blue', '📋 TEST 13: Obtener datos desde HC para crear receta');
    await testEndpoint('GET', `/historias-clinicas/${historiaClinicaId}/datos-receta`, null, token);
    console.log();
  }

  // TEST 14: Anular receta
  log('blue', '📋 TEST 14: Anular receta');
  await testEndpoint('DELETE', `/recetas/${recetaId}`, null, token);
  console.log();

  // Resumen final
  log('cyan', '\n' + '='.repeat(60));
  log('green', '✅ PRUEBAS COMPLETADAS');
  log('cyan', '='.repeat(60) + '\n');
}

// Ejecutar pruebas
runTests().catch(error => {
  log('red', `\n❌ Error fatal: ${error.message}`);
  console.error(error);
});
