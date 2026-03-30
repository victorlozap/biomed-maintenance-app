const fs = require('fs');
const path = './src/data/protocols.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data["FLUJOMETRO"] = {
    "template": "",
    "title": "LISTA DE CHEQUEO MANTENIMIENTO PREVENTIVO FLUJOMETROS, CONCENTRADORES DE OXIGENO, VACUTRONES, ASPIRADORES Y REGULADORES DE GASES",
    "code": "GRF3MAN-FR43",
    "version": "6.0",
    "date": "03-02-2025",
    "items": [
      { "id": "f1", "category": "ACTIVIDADES REALIZADAS", "label": "Asegúrese de que el equipo se encuentre limpio, sin humedad, sin objetos extraños y carcasa en buen estado.", "type": "check" },
      { "id": "f2", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión estado fisico de pulsadores, indicadores luminosos, display y swiches", "type": "check" },
      { "id": "f3", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión de cable de poder", "type": "check" },
      { "id": "f4", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión, ajuste y limpieza del manómetro, reemplazo del mismo si es necesario", "type": "check" },
      { "id": "f5", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión del buen estado físico del acople de conexión", "type": "check" },
      { "id": "f6", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión, ajuste y limpieza de la válvula reguladora reemplazo de la misma si es necesario", "type": "check" },
      { "id": "f7", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión y cambio de Oring si se requiere", "type": "check" },
      { "id": "f8", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión y limpieza de tubo escala (Mirilla), reemplazo del mismo si es necesario", "type": "check" },
      { "id": "f9", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión de rosca", "type": "check" },
      { "id": "f10", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión y limpieza de camisa externa, reemplazo de la misma si es necesario", "type": "check" },
      { "id": "f11", "category": "ACTIVIDADES REALIZADAS", "label": "Revision y/o Cambio de filtro", "type": "check" },
      { "id": "f12", "category": "ACTIVIDADES REALIZADAS", "label": "Inspeccion del liner", "type": "check" },
      { "id": "f13", "category": "ACTIVIDADES REALIZADAS", "label": "Revisión del motor", "type": "check" },
      { "id": "f14", "category": "ACTIVIDADES REALIZADAS", "label": "Revision de trampa de agua", "type": "check" },
      { "id": "f15", "category": "ACTIVIDADES REALIZADAS", "label": "Limpieza general", "type": "check" },
      { "id": "f16", "category": "ACTIVIDADES REALIZADAS", "label": "Pruebas de funcionamiento", "type": "check" }
    ],
    "numeric_items": [
      { "id": "n1", "category": "SEGURIDAD ELECTRICA", "label": "Red eléctrica L1-L2", "type": "text" },
      { "id": "n2", "category": "SEGURIDAD ELECTRICA", "label": "Red eléctrica L1-gnd", "type": "text" },
      { "id": "n3", "category": "SEGURIDAD ELECTRICA", "label": "Red eléctrica L2-gnd", "type": "text" },
      { "id": "n4", "category": "SEGURIDAD ELECTRICA", "label": "Resistencia cable de poder EBP (<= 0,2 Ohms)", "type": "text" },
      { "id": "n5", "category": "SEGURIDAD ELECTRICA", "label": "Corriente de fuga a tierra Neutro abierto (<= 1000 µA)", "type": "text" },
      { "id": "n6", "category": "SEGURIDAD ELECTRICA", "label": "Corriente de fuga a tierra Normal (<= 500 µA)", "type": "text" },
      { "id": "n7", "category": "SEGURIDAD ELECTRICA", "label": "Corriente de Fuga a chasis EBP Normal (<= 100 µA)", "type": "text" },
      { "id": "n8", "category": "SEGURIDAD ELECTRICA", "label": "Corriente de Fuga a chasis EBP Neutro abierto (<= 500 µA)", "type": "text" },
      { "id": "n9", "category": "SEGURIDAD ELECTRICA", "label": "Corriente de Fuga a chasis EBP Tierra abierta (<= 500 µA)", "type": "text" }
    ]
};

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Done mapping Flujometro');
