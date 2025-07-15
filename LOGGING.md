# Card Game Backend Logging System

This document describes the comprehensive logging and monitoring system implemented for the Card Game Backend.

## Overview

The logging system uses **Winston** for structured logging with **Grafana** + **Loki** + **Promtail** for log aggregation, visualization, and monitoring.

## Architecture

```txt
Backend App (Winston) → Log Files → Promtail → Loki → Grafana
```

### Components

1. **Winston Logger** - Structured JSON logging in the Node.js backend
2. **Loki** - Log aggregation system
3. **Promtail** - Log shipping agent
4. **Grafana** - Visualization and dashboards

## Setup and Usage

### 1. Start the Logging Stack

```bash
# Make the script executable (Linux/Mac)
chmod +x start-logging.sh

# Start the monitoring stack
./start-logging.sh

# Or manually with Docker Compose
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Grafana

- **URL**: <http://localhost:3000>
- **Username**: admin
- **Password**: admin123

### 3. Start the Backend

```bash
cd backend
npm run dev
```

### 4. Generate Test Logs

```bash
cd backend
npx ts-node src/utils/testLogging.ts
```

## Log Structure

All logs are structured JSON with the following standard fields:

```json
{
  "timestamp": "2025-01-16T10:30:00.123Z",
  "level": "info",
  "service": "card-game-backend",
  "message": "Action executed",
  "gameId": "abc12345",
  "playerId": "player123",
  "action": "ATTACK_NEXUS",
  "success": true,
  "damage": 5,
  "oldHp": 20,
  "newHp": 15
}
```

## Log Levels

- **ERROR**: Critical errors that need immediate attention
- **WARN**: Warning conditions and blocked actions
- **INFO**: General game events and successful actions
- **DEBUG**: Detailed information for debugging

## Log Files

Logs are written to the following files:

- `backend/logs/app.log` - All logs (info and above)
- `backend/logs/error.log` - Error logs only
- `backend/logs/debug.log` - Debug and above logs

## Monitored Events

### Game Events

- Game creation and initialization
- Player actions (draw, play, attack, end turn)
- Combat events with damage calculations
- Win/loss conditions
- State changes and phase transitions

### Performance Metrics

- Action execution times
- Memory usage patterns
- Request processing durations

### Error Tracking

- Failed actions and reasons
- Invalid game states
- System errors with stack traces

### Security Events

- Invalid player actions
- Unauthorized game access attempts

## Grafana Dashboards

The system includes pre-configured dashboards:

### 1. Game Actions Timeline

- Real-time log stream of all game events
- Filterable by game ID, player, or action type

### 2. Error Monitoring

- Error rate over time
- Recent error logs with details
- Error distribution by type

### 3. Performance Metrics

- Action execution time trends
- Memory usage graphs
- Request throughput

### 4. Combat Analytics

- Attack frequency and damage patterns
- Win/loss statistics
- Beast usage patterns

## Log Queries

### Common Loki Queries

```logql
# All logs for a specific game
{job="card-game"} |= "abc12345"

# Combat events only
{job="card-game"} |= "COMBAT"

# Error logs in the last hour
{job="card-game", level="error"} |= ""

# Performance metrics
{job="card-game"} | json | performance_label != ""

# Specific player actions
{job="card-game"} | json | playerId = "player123"

# Failed actions
{job="card-game"} | json | success = "false"
```

## Alerting (Future Enhancement)

The system is ready for alerting rules:

1. **High Error Rate**: > 5% of actions failing
2. **Slow Performance**: Action execution > 1000ms
3. **Memory Issues**: High memory usage patterns
4. **Game Stuck**: No actions for > 5 minutes in active games

## Development Tips

### Adding New Log Events

```typescript
import logger, { gameLogger } from '../utils/logger';

// For general events
logger.info('Custom event occurred', {
  gameId,
  playerId,
  action: 'CUSTOM_ACTION',
  customField: 'value',
});

// For game-specific events
gameLogger.actionExecuted(gameId, playerId, 'CUSTOM_ACTION', true, {
  additionalData: 'value',
});
```

### Performance Logging

```typescript
import { createTimer } from '../utils/logger';

const timer = createTimer('expensiveOperation');
// ... perform operation
timer.end({ gameId, additionalContext: 'value' });
```

### Error Logging

```typescript
try {
  // risky operation
} catch (error) {
  logger.error('Operation failed', {
    gameId,
    playerId,
    action: 'RISKY_OPERATION',
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
}
```

## Maintenance

### Log Retention

- Logs are automatically rotated when files exceed 5MB
- Up to 10 app.log files are kept
- Up to 5 error.log files are kept
- Loki retains logs for 7 days by default

### Monitoring the Monitoring

- Check Docker container health: `docker-compose -f docker-compose.monitoring.yml ps`
- View Loki logs: `docker logs card-game-loki`
- View Promtail logs: `docker logs card-game-promtail`

### Cleanup

```bash
# Stop the monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# Remove volumes (clears all log data)
docker-compose -f docker-compose.monitoring.yml down -v
```

## Troubleshooting

### Common Issues

1. **No logs in Grafana**

   - Check if Promtail is running: `docker logs card-game-promtail`
   - Verify log files exist in `backend/logs/`
   - Check Loki connectivity

2. **High memory usage**

   - Adjust log retention settings in `loki-config.yml`
   - Reduce log level in production

3. **Missing performance metrics**
   - Ensure `createTimer()` is being used correctly
   - Check debug log level is enabled

## Security Considerations

- Log files may contain sensitive game data
- Ensure proper access controls on log files
- Consider log anonymization for production
- Monitor log volume to prevent disk space issues

## Future Enhancements

1. **Metrics Integration** (Prometheus + Grafana)
2. **Distributed Tracing** (Jaeger integration)
3. **Log Anonymization** for privacy compliance
4. **Advanced Alerting** with PagerDuty/Slack integration
5. **Log Analysis** with AI/ML for pattern detection
