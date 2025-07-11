/**
 * 🚀 CLUSTER MIDDLEWARE
 * Easy Gift Search - Multi-process optimization
 */

const cluster = require('cluster');
const os = require('os');

class ClusterManager {
  constructor() {
    this.numCPUs = os.cpus().length;
    this.workers = new Map();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Inicializar cluster apenas em produção
  init() {
    if (!this.isProduction || process.env.DISABLE_CLUSTER === 'true') {
      console.log('🔧 Running in single process mode');
      return false;
    }

    if (cluster.isMaster) {
      console.log(`🚀 Master process ${process.pid} is running`);
      console.log(`🔧 Starting ${this.numCPUs} workers...`);

      // Criar workers
      for (let i = 0; i < this.numCPUs; i++) {
        this.forkWorker(i);
      }

      // Monitorar workers
      cluster.on('exit', (worker, code, signal) => {
        console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
        this.forkWorker();
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('🛑 Master received SIGTERM, shutting down workers...');
        for (const worker of Object.values(cluster.workers)) {
          worker.kill('SIGTERM');
        }
      });

      return true; // É master, não continuar com server
    }

    console.log(`👷 Worker ${process.pid} started`);
    return false; // É worker, continuar com server
  }

  forkWorker(id = null) {
    const worker = cluster.fork();
    if (id !== null) {
      this.workers.set(id, worker);
    }
    
    worker.on('message', (msg) => {
      if (msg.type === 'metrics') {
        this.handleWorkerMetrics(worker.id, msg.data);
      }
    });
  }

  handleWorkerMetrics(workerId, metrics) {
    // Agregar métricas de todos os workers
    console.log(`📊 Worker ${workerId} metrics:`, metrics);
  }

  // Balanceamento de carga básico
  getWorkerStatus() {
    return {
      totalWorkers: this.numCPUs,
      activeWorkers: Object.keys(cluster.workers).length,
      masterPid: process.pid,
      workers: Object.values(cluster.workers).map(w => ({
        id: w.id,
        pid: w.process.pid,
        state: w.state
      }))
    };
  }
}

module.exports = new ClusterManager();
