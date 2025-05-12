var model = require("../model/adPayoutHistory");

module.exports.PayoutHistory = async (req, res) => {
  try {
    let { user_id } = req.headers;

    let admin_id = req.user.admin_id;
    let admin_role = req.user.role;
    let { invest_id } = req.body;

    var adminData = await model.getAdmin(admin_id, admin_role);
    if (adminData[0]?.ad_role == "user") {
      return res.send({
        result: false,
        message: "Access Denied,try with authorized account",
      });
    }

    var condition = "";
    if (user_id) {
      condition = `WHERE payout_history.ph_invest_u_id ='${user_id}'`;
    }
    if (invest_id) {
      condition = `WHERE payout_history.ph_invest_id ='${invest_id}'`;
    }

    var payouthistorylist = await model.getPayoutHistory(condition);

    if (payouthistorylist.length > 0) {
      return res.send({
        result: true,
        message: "data retrieved successfully",
        data: payouthistorylist,
      });
    } else {
      return res.send({
        result: false,
        message: "No payout cycle found",
      });
    }
  } catch (error) {
    return res.send({
      result: false,
      message: error.message,
    });
  }
};

module.exports.EditPayout = async (req, res) => {
  try {
    let user_id = req.user.admin_id;
    let admin_role = req.user.role;

    var adminData = await model.getAdmin(user_id, admin_role);
    if (adminData[0]?.ad_role == "user") {
      return res.send({
        result: false,
        message: "Access Denied,try with authorized account",
      });
    }

    let {
      payout_id,
      ph_payout_cycle,
      ph_amount,
      ph_payout_date,
      ph_deduction_amount,
      ph_total_payable,
    } = req.body;

    if (!payout_id) {
      return res.send({
        result: false,
        messaage: "insufficient parameter",
      });
    }
    var checkpayoutData = await model.CheckpayoutDataQuery(payout_id);

    if (checkpayoutData.length > 0) {
      let condition = ``;

      if (ph_payout_cycle) {
        if (condition == "") {
          condition = `set ph_payout_cycle ='${ph_payout_cycle}' `;
        } else {
          condition += `,ph_payout_cycle='${ph_payout_cycle}'`;
        }
      }
      if (ph_amount) {
        if (condition == "") {
          condition = `set ph_amount ='${ph_amount}' `;
        } else {
          condition += `,ph_amount='${ph_amount}'`;
        }
      }
      if (ph_payout_date) {
        if (condition == "") {
          condition = `set ph_payout_date ='${ph_payout_date}' `;
        } else {
          condition += `,ph_payout_date='${ph_payout_date}'`;
        }
      }
      if (ph_deduction_amount) {
        if (condition == "") {
          condition = `set ph_deduction_amount ='${ph_deduction_amount}' `;
        } else {
          condition += `,ph_deduction_amount='${ph_deduction_amount}'`;
        }
      }

      if (ph_total_payable) {
        if (condition == "") {
          condition = `set ph_total_payable ='${ph_total_payable}' `;
        } else {
          condition += `,ph_total_payable='${ph_total_payable}'`;
        }
      }

      if (condition !== "") {
        var EditpayoutData = await model.ChangepayoutDataQuery(
          condition,
          payout_id
        );
      }
      if (EditpayoutData) {
        return res.send({
          result: true,
          message: "payout Data updated successfully",
        });
      } else {
        return res.send({
          result: false,
          message: "failed to update payout Data",
        });
      }
    } else {
      return res.send({
        result: false,
        message: "payout Data does not exists",
      });
    }
  } catch (error) {
    return res.send({
      result: false,
      message: error.message,
    });
  }
};
