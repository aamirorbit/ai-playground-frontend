import { atom } from 'jotai';
import { AIModel, GroupedModels, ModelCapabilities, ModelStats } from '../types/api';

// Core model data atoms
export const allModelsAtom = atom<AIModel[]>([]);
export const groupedModelsAtom = atom<GroupedModels>({});
export const modelCapabilitiesAtom = atom<ModelCapabilities>({});
export const modelStatsAtom = atom<ModelStats | null>(null);

// Loading states
export const modelsLoadingAtom = atom<boolean>(false);
export const modelsErrorAtom = atom<string | null>(null);

// Derived atoms
export const providersAtom = atom((get) => {
  const grouped = get(groupedModelsAtom);
  return Object.keys(grouped);
});

export const modelsByProviderAtom = atom((get) => (provider: string) => {
  const grouped = get(groupedModelsAtom);
  return grouped[provider] || [];
});

export const getModelByIdAtom = atom((get) => (modelId: string) => {
  const models = get(allModelsAtom);
  return models.find(model => model.id === modelId) || null;
});

// Filter atoms
export const selectedCapabilityFilterAtom = atom<string | null>(null);
export const selectedProviderFilterAtom = atom<string | null>(null);
export const searchQueryAtom = atom<string>('');

// Filtered models atom
export const filteredModelsAtom = atom((get) => {
  const models = get(allModelsAtom);
  const capabilityFilter = get(selectedCapabilityFilterAtom);
  const providerFilter = get(selectedProviderFilterAtom);
  const searchQuery = get(searchQueryAtom);
  const capabilities = get(modelCapabilitiesAtom);

  let filtered = models;

  // Filter by capability
  if (capabilityFilter && capabilities[capabilityFilter]) {
    const modelIds = capabilities[capabilityFilter];
    filtered = filtered.filter(model => modelIds.includes(model.id));
  }

  // Filter by provider
  if (providerFilter) {
    filtered = filtered.filter(model => model.provider === providerFilter);
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(model =>
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query) ||
      model.capabilities.some(cap => cap.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// Model comparison atoms
export const selectedModelsAtom = atom<string[]>([]);
export const minSelectedModelsAtom = atom<number>(2); // Minimum required for comparison
export const maxSelectedModelsAtom = atom<number>(3); // Maximum for optimal UX

// Add/remove model actions
export const addModelAtom = atom(
  null,
  (get, set, modelId: string) => {
    const current = get(selectedModelsAtom);
    const max = get(maxSelectedModelsAtom);
    
    if (!current.includes(modelId) && current.length < max) {
      set(selectedModelsAtom, [...current, modelId]);
    }
  }
);

export const removeModelAtom = atom(
  null,
  (get, set, modelId: string) => {
    const current = get(selectedModelsAtom);
    set(selectedModelsAtom, current.filter(id => id !== modelId));
  }
);

export const toggleModelAtom = atom(
  null,
  (get, set, modelId: string) => {
    const current = get(selectedModelsAtom);
    const max = get(maxSelectedModelsAtom);
    
    if (current.includes(modelId)) {
      // Allow removal of any selected model
      set(selectedModelsAtom, current.filter(id => id !== modelId));
    } else if (current.length < max) {
      set(selectedModelsAtom, [...current, modelId]);
    }
  }
);

export const clearSelectedModelsAtom = atom(
  null,
  (get, set) => {
    set(selectedModelsAtom, []);
  }
);

// Selected models details atom
export const selectedModelsDetailsAtom = atom((get) => {
  const selectedIds = get(selectedModelsAtom);
  const models = get(allModelsAtom);
  
  return selectedIds.map(id => 
    models.find(model => model.id === id)
  ).filter(Boolean) as AIModel[];
});

// Validation atoms
export const canStartComparisonAtom = atom((get) => {
  const selectedCount = get(selectedModelsAtom).length;
  const min = get(minSelectedModelsAtom);
  return selectedCount >= min;
});

export const canRemoveModelAtom = atom((get) => (modelId: string) => {
  const current = get(selectedModelsAtom);
  return current.includes(modelId); // Can always remove if selected
});