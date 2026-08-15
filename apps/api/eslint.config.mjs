// Локальная точка входа ESLint для apps/api.
// Все правила живут в общем пакете: packages/eslint-config/nest.js
// (он же подключает base.js и eslint-config-prettier в конце цепочки).
import nest from '@minimishki/eslint-config/nest';

export default nest;
