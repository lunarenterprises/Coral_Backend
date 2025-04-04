var cron = require('node-cron');

var { PayoutCycle } = require('../controller/adPayoutCycle')
cron.schedule('*/1 * * * *', PayoutCycle)

var { CheckAndCreateNextPayout } = require('../controller/adPayoutCycle')
cron.schedule('*/1 * * * *', CheckAndCreateNextPayout)

var { CheckAndUpdatePayoutStatus } = require('../controller/adPayoutCycle')
cron.schedule('*/1 * * * *', CheckAndUpdatePayoutStatus)