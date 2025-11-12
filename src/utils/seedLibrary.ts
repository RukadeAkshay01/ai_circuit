import { supabase } from '../lib/supabase';
import { COMPONENT_LIBRARY } from './simulation';

export async function seedComponentLibrary() {
  try {
    for (const component of COMPONENT_LIBRARY) {
      const { error } = await supabase
        .from('component_library')
        .upsert({
          name: component.name,
          category: component.category,
          description: component.description,
          component_type: component.componentType,
          default_properties: component.defaultProperties,
          pins: component.pins,
        }, {
          onConflict: 'component_type'
        });

      if (error && error.code !== 'PGRST116') {
        console.error(`Failed to seed ${component.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error seeding library:', error);
  }
}
