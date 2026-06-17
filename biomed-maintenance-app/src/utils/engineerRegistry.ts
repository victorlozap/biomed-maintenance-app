export interface Engineer {
  name: string;
  cargo: string;
  pattern: string;
  firma: string;
  email: string;
}

export const ENGINEERS: Engineer[] = [
  { 
    name: 'VICTOR LOPEZ', 
    cargo: 'INGENIERO BIOMÉDICO', 
    pattern: 'victor', 
    firma: '/imagenes/firma-victor-lopez.png', 
    email: 'victor.lopez.ing@gmail.com' 
  },
  { 
    name: 'LEONARDO GRAJALES', 
    cargo: 'INGENIERO BIOMÉDICO', 
    pattern: 'leograjales', 
    firma: '/imagenes/firma-leonardo.png', 
    email: 'leograjales14@gmail.com' 
  },
  { 
    name: 'CAMILO RAMIREZ', 
    cargo: 'INGENIERO BIOMÉDICO', 
    pattern: 'kmiloramirez', 
    firma: '/imagenes/firma-camilo.png', 
    email: 'j.kmiloramirez@hotmail.com' 
  },
  { 
    name: 'CRISTIAN HURTADO', 
    cargo: 'INGENIERO BIOMÉDICO', 
    pattern: 'cristiand.hurtado', 
    firma: '/imagenes/firma-cristian.png', 
    email: 'ingcristiand.hurtado@gmail.com' 
  },
  { 
    name: 'ANA VARON', 
    cargo: 'INGENIERA BIOMÉDICA', 
    pattern: 'ana.varon', 
    firma: '/imagenes/firma-ana-varon.png', 
    email: 'ana.varon515@gmail.com' 
  },
  { 
    name: 'TATIANA SALAZAR', 
    cargo: 'INGENIERA BIOMÉDICA', 
    pattern: 'tsalazar', 
    firma: '/imagenes/firma-tatiana.png', 
    email: 'tsalazarnaranjo@gmail.com' 
  },
  { 
    name: 'DAVID OSPINA', 
    cargo: 'INGENIERO BIOMÉDICO', 
    pattern: 'david', 
    firma: '', 
    email: '' 
  }
];

export function findEngineerByEmail(email: string): Engineer | undefined {
  if (!email) return undefined;
  
  // Try exact match first
  let eng = ENGINEERS.find(e => e.email.toLowerCase() === email.toLowerCase());
  if (eng) return eng;
  
  // Fallback to pattern matching on the email prefix
  const prefix = email.split('@')[0].toLowerCase();
  return ENGINEERS.find(e => prefix.includes(e.pattern.toLowerCase()));
}

export function findEngineerByName(name: string): Engineer | undefined {
  if (!name) return undefined;
  return ENGINEERS.find(e => e.name === name || e.name.includes(name));
}

export function getEngineerSignature(emailOrName: string): { firma: string; name: string; cargo: string } {
  let eng = findEngineerByEmail(emailOrName) || findEngineerByName(emailOrName);
  
  if (eng) {
    return {
      firma: eng.firma,
      name: eng.name,
      cargo: eng.cargo
    };
  }
  
  // Default fallback if not found
  return {
    firma: '',
    name: emailOrName.split('@')[0].toUpperCase(),
    cargo: 'INGENIERO BIOMÉDICO'
  };
}
