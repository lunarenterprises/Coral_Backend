var cron = require('node-cron');

cron.schedule("*/5 * * * *", require('./adPayoutCycle').PayoutCycle)

cron.schedule("*/5 * * * *", require('./adPayoutCycle').CheckAndCreateNextPayout)

cron.schedule("*/5 * * * *", require('./adPayoutCycle').CheckAndUpdatePayoutStatus)
