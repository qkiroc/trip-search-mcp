module.exports = {
  apps: [
    {
      name: 'trip-search-mcp',
      script: './dist/index.js',
      cwd: './',
      instances: 1, // 可以设置为 'max' 来使用所有CPU核心
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 自动重启配置
      min_uptime: '10s',
      max_restarts: 10,

      // 健康检查
      health_check_grace_period: 3000,

      // 进程管理
      kill_timeout: 5000,
      restart_delay: 4000,

      // 忽略监听文件变化
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],

      // 高级配置
      source_map_support: true,
      instance_var: 'INSTANCE_ID'

      // 集群模式配置（如果需要）
      // instances: 'max',
      // exec_mode: 'cluster'
    }
  ]
};
