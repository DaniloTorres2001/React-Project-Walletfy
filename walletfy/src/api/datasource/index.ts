import LocalStorageDS from '../impl/ds/LocalStorageDS'
import DataRepoImpl from '../impl/repo/DataRepoImpl'

const LS = new LocalStorageDS()
const DataRepo = new DataRepoImpl(LS)

export default DataRepo
