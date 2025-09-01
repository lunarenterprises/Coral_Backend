var model = require('../model/Addorder')
let nomineeModel = require('../model/cwiInvestment')
var moment = require('moment')
var fs = require('fs');
const path = require('path')
const { createPdfWithPuppeteer } = require('../util/pdfGeneration');
const notification = require('../util/saveNotification');
const { sendNotificationToAdmins } = require('../util/firebaseConfig');


module.exports.AddOrder = async (req, res) => {
    try {
        var day = moment().format('DD')
        var month = moment().format('MMMM')
        var year = moment().format('YYYY')
        var date = moment().format("YYYY-MM-DD")
        var moddate = moment().format("DD_MM_YYYY")
        let { user_id } = req.headers
        if (!user_id) {
            return res.send({
                result: false,
                message: "User id is required"
            })
        }
        let { investment, securityOption, clientInfo, bankAccount, nomineeDetails, payment_method } = req.body
        let futureDate = moment().add(parseFloat(investment.investment_duration), 'years');
        let investment_duration = futureDate.format('YYYY/MM/DD');
        let project_name = investment.project_name
        let investment_amount = investment.investment_amount
        let profit_model = investment.profit_model
        let withdrawal_frequency = investment.withdrawal_frequency
        let client_name = clientInfo.clientName
        let passportId = clientInfo.passportId
        let nationalId = clientInfo.nationalId
        let residentialAddress = clientInfo.residentialAddress
        let phone = clientInfo.phone
        let email = clientInfo.email
        let nomineeFullName = nomineeDetails.nomineeFullName
        let relationship = nomineeDetails.relationship
        let contactNumber = nomineeDetails.contactNumber
        let nominee_residentialAddress = nomineeDetails.residentialAddress
        let percentage = investment.percentage
        let return_amount = investment.return_amount
        if (payment_method === "bank" && !bankAccount) {
            return res.send({
                result: false,
                message: "Bank id is requried"
            })
        }
        const userdetails = await model.getUser(user_id)
        if (userdetails.length === 0) {
            return res.send({
                result: false,
                message: "User not found."
            })
        }
        if (payment_method === "wallet" && investment_amount > userdetails[0]?.u_wallet) {
            return res.send({
                result: false,
                message: "Insufficient amount in wallet"
            })
        }
        let bankaccount = null
        if (bankAccount) {
            bankaccount = await model.getBankaccount(bankAccount)
            if (!bankaccount || bankaccount.length === 0) {
                return res.send({
                    result: false,
                    message: "Bank not found. Invalid bank id"
                })
            }
        } else {
            bankaccount = await model.getUserBank(user_id)
            if (!bankaccount || bankaccount.length === 0) {
                return res.send({
                    result: false,
                    message: "You need to add your bank first"
                })
            }
        }
        let nomineeData = null
        let createdNominee = null
        if (nomineeFullName) {
            nomineeData = await nomineeModel.getnomineeDetails(user_id)
            if (nomineeData.length === 0) {
                createdNominee = await model.AddNominee(user_id, nomineeFullName, relationship, contactNumber, nominee_residentialAddress)
            }
        }
        if (!userdetails[0]?.u_kyc || userdetails[0]?.u_kyc !== "verified") {
            return res.send({
                result: false,
                message: "KYC needs to be verified before investing"
            })
        }
        let usernme = userdetails[0]?.u_name.toUpperCase().substring(0, 3)
        // let savedetails = await model.AddInvest()
        // 1️⃣  Central EBS-mounted directory
        const agreementDir = '/mnt/ebs500/uploads/agreement';      // disk location
        const filename = `CON_${usernme}_${moddate}.pdf`;
        const fullPath = path.join(agreementDir, filename);    // /mnt/ebs500/uploads/agreement/CON_...

        // 2️⃣  Make sure the folder exists
        if (!fs.existsSync(agreementDir)) {
            fs.mkdirSync(agreementDir, { recursive: true });
        }
//         let notarizationAgreement = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <title>Financing Agreement</title>
//   <style>
//   .watermark-text {
//             position: fixed;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             font-size: 6em;
//             color: rgba(0, 0, 0, 0.05);
//             text-transform: uppercase;
//             white-space: nowrap;
//             pointer-events: none;
//             z-index: -1;
//         }
// .page {
//             max-width: 800px;
//             margin: 20px auto;
//             padding: 20px;
//             background: white;
//             box-shadow: 0 0 10px rgba(0,0,0,0.1);
//             border-radius: 8px;
//             page-break-after: always;
//         }
//         .header {
//             background: linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%);
//             padding: 20px 0;
//             margin-bottom: 30px;
//             width: 100%;
//             text-align: center;
//             border-radius: 8px 8px 0 0;
//         }

//         .header img {
//             width: 180px;
//             height: auto;
//             max-width: 100%;
//         }
//     body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; font-size: 14px; }
//     h1, h2, h3 { color: #003366; }
//     .section-title { font-weight: bold; margin-top: 30px; font-size: 16px; }
//     .signature-block { margin-top: 50px; }
//     .signature { display: flex; justify-content: space-between; margin-top: 40px; }
//     .signature div { width: 45%; }
//     .annex, .nominee { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
//   </style>
// </head>
// <body>
//     <div class="page">
// <div class="watermark-text">CORAL WEALTH</div>
//     <div class="header">
//         <img src="https://coral.lunarsenterprises.com/uploads/agreement_needs/coraluae.webp" alt="Coral Wealth Investment Logo">
//     </div>
// <h1 style="text-align:center;">Financing Agreement</h1>

// <p>This financing agreement is made on the ${day} day of ${month} ${year} between:</p>

// <p><strong>Party One:</strong><br>
// CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C, a limited liability company registered in Dubai, United Arab Emirates... (license numbers: 1250854, 1435972, 53586).</p>

// <p><strong>Party Two:</strong><br>
// ${usernme}, holder of UAE ID number ……. and passport number ……. residing at … phone number: ${userdetails[0]?.u_mobile} email: ${userdetails[0]?.u_email}</p>

// <h2 class="section-title">1. Definitions</h2>
// <ul>
//   <li><strong>Business Days:</strong> Any day other than weekend, public or bank holiday in the UAE.</li>
//   <li><strong>Financing Amount:</strong> Monetary amount provided by Party Two to Party One.</li>
//   <li><strong>Certification:</strong> Official documentation under UAE laws.</li>
//   <li><strong>Term:</strong> Duration of agreement.</li>
//   <li><strong>Arbitration:</strong> As per DIAC rules and UAE Federal Law No. (6) of 2018.</li>
// </ul>

// <h2 class="section-title">2. Purpose</h2>
// <p>Party Two provides financing to Party One for investment in emerging industries...</p>

// <h2 class="section-title">3. Financing Amount</h2>
// <p>Amount: ……….. AED, transferred to the official account:</p>
// <ul>
//   <li><strong>Account Name:</strong> CORAL WEALTH INVESTMENT IN HEALTHCARE...</li>
//   <li><strong>IBAN:</strong> AE330860000009467791855</li>
//   <li><strong>SWIFT:</strong> WIOBAEADXXX</li>
//   <li><strong>Account No:</strong> 9467791855</li>
// </ul>

// <p>Party Two’s account (for profit distribution):</p>
// <ul>
//   <li><strong>Account Name:</strong> ${bankaccount[0]?.b_name_as}</li>
//   <li><strong>IFSC:</strong> ${bankaccount[0]?.b_ifsc_code}</li>
// </ul>

// <h2 class="section-title">4. Profit Sharing Models</h2>
// <p>Options:</p>
// <ol>
//   <li><strong>Variable Profit Model:</strong> 80% to Party Two, 20% to Party One.</li>
//   <li><strong>Fixed Yield Model:</strong> Fixed yield regardless of actual profits.</li>
//   <li><strong>Selection:</strong> To be recorded in Annex (A).</li>
// </ol>

// <h2 class="section-title">5. Payment Terms</h2>
// <ul>
//   <li><strong>Frequency:</strong> Monthly, Quarterly, Semi-Annually, or Annually.</li>
//   <li><strong>Bank transfer only.</strong></li>
//   <li><strong>Bank charges:</strong> Borne by Party Two.</li>
// </ul>

// <h2 class="section-title">6. Guarantees Provided</h2>
// <p>Guarantees include court-certified agreements and signed commercial contracts. Costs borne by Party Two.</p>

// <h2 class="section-title">7. Termination</h2>
// <p>Details early and term-end termination clauses, refund of financing amount, and suspended profits upon early exit.</p>

// <h2 class="section-title">8. Arbitration</h2>
// <p>Disputes resolved by DIAC in accordance with UAE arbitration laws.</p>

// <h2 class="section-title">9. General Provisions</h2>
// <ul>
//   <li>Entire agreement clause</li>
//   <li>Written amendments only</li>
//   <li>Governing law: UAE</li>
// </ul>

// <div class="annex">
//   <h2>Annex (A): Financing Amount and Profit Sharing Details</h2>
//   <ul>
//     <li>Financing Amount: ${investment_amount}</li>
//     <li>Profit Sharing Model: ${profit_model}</li>
//     <li>Annual Return (%): ${percentage}</li>
//     <li>Profit Payment Period: ${withdrawal_frequency}</li>
//     <li>Contract Term: ${investment_duration}</li>
//   </ul>
// </div>

// <div class="signature-block">
//   <h2>Signatures</h2>
//   <div class="signature">
//     <div>
//       <strong>Party One:</strong><br>
//       Name: Sagithra Nath G<br>
//       Title: CEO and General Manager<br>
//       Signature: __________
//     </div>
//     <div>
//       <strong>Party Two:</strong><br>
//       Name: ${usernme}<br>
//       Signature: __________
//     </div>
//   </div>
// </div>

// <div class="nominee">
//   <h2>Nominee Appointment Acknowledgment</h2>
//   <p>I, ${usernme}, holder of UAE ID number … acknowledge and appoint the following nominee:</p>
//   <ul>
//     <li>Full Name: ${nomineeData ? nomineeData[0]?.n_name : ""}</li>
//     <li>Relationship: ${nomineeData ? nomineeData[0]?.n_relation : ''}</li>
//     <li>ID/Passport: __________</li>
//     <li>Contact: ${nomineeData ? nomineeData[0]?.n_mobile : ''}</li>
//   </ul>
//   <p>Candidate Rights: Receive profits, capital, and represent legally.</p>
//   <p>Party One is not responsible for candidate actions. This follows UAE law.</p>
//   <p>Signatures: Party Two & Candidate</p>
// </div>
// </div>
// </body>
// </html>
// `
//         let shareAgreement = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Share Transfer Agreement</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 20px;
//         }
//         .header {
//             text-align: center;
//             margin-bottom: 30px;
//             border-bottom: 2px solid #00529b;
//             padding-bottom: 10px;
//         }
//         h1 {
//             color: #00529b;
//             text-transform: uppercase;
//             font-weight: bold;
//         }
//         h2 {
//             color: #00529b;
//             border-bottom: 1px solid #ccc;
//             padding-bottom: 5px;
//             margin-top: 20px;
//         }
//         .parties {
//             margin: 20px 0;
//         }
//         .clause {
//             margin-bottom: 20px;
//         }
//         .indent {
//             margin-left: 20px;
//         }
//         .double-indent {
//             margin-left: 40px;
//         }
//         .signature {
//             margin-top: 40px;
//             display: flex;
//             justify-content: space-between;
//         }
//         .signature-box {
//             border-top: 1px solid #333;
//             width: 45%;
//             padding-top: 10px;
//             text-align: center;
//         }
//         .highlight {
//             font-weight: bold;
//         }
//         ul {
//             list-style-type: none;
//             padding-left: 20px;
//         }
//         li::before {
//             content: "- ";
//         }
//     </style>
// </head>
// <body>
//     <div class="header">
//         <h1>Share Transfer Agreement</h1>
//         <p><strong>Contract Date: ${moddate}</strong></p>
//         <p>Pursuant to the UAE Commercial Companies Law (Federal Law No. 32 of 2021)</p>
//     </div>

//     <div class="parties">
//         <p><strong>Between:</strong></p>
//         <p>The shareholders of CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C, a company registered in the Emirate of Dubai, United Arab Emirates, under license number 1250854, with its registered office at Business Bay, Dubai, United Arab Emirates.</p>
        
//         <p><strong>Transferor:</strong><br>
//         Ganeshwaran Vijayaratanam Vijayaratanam</p>
        
//         <p><strong>Transferee:</strong><br>
//         ${usernme}</p>
//     </div>

//     <div class="clause">
//         <h2>1. Preamble</h2>
//         <p>CORAL WEALTH INVESTMENT IN HEALTHCARE ENTERPRISES & DEVELOPMENT CO. L.L.C (hereinafter referred to as the "Company") is registered under a license issued by the Dubai Department of Tourism and Economy and is authorized to engage in (investment in technological projects, their establishment, and management / investment in healthcare projects, their establishment, and management / investment in educational projects, their establishment, and management), and other growing industries under license numbers (1250854, 1435972, 53586), in accordance with the laws of the United Arab Emirates, with its principal place of business in Dubai.</p>
        
//         <p>The Transferor owns ....% of the share capital of the Company (hereinafter referred to as the "Shares").</p>
        
//         <p>The Transferor wishes to transfer ownership of (....) Shares to the Transferee, who has agreed to purchase them under the terms and conditions set forth below.</p>
//     </div>

//     <div class="clause">
//         <h2>2. Definitions</h2>
//         <p><strong>Shares:</strong> Refers to (....) shares issued by the Company.</p>
//         <p><strong>Purchase Price:</strong> Refers to the amount of ${investment_amount} AED per share, totaling ${investment_amount} AED.</p>
//         <p><strong>Board of Directors:</strong> Refers to the Company's governing body responsible for its management and strategic direction.</p>
//         <p><strong>Fair Market Value:</strong> The value of the Shares as determined by an independent auditor appointed by the Company's Board of Directors, reflecting the prevailing market price at the time of the Withdrawal Notice.</p>
//         <p><strong>Withdrawal Notice:</strong> A written request by a shareholder to the Company to repurchase their Shares under the terms of this Agreement.</p>
//         <p><strong>Notice Period:</strong> A period of 3 months if the total capital to be withdrawn is less than 500,000 AED, or 6 months if equal to or exceeding 500,000 AED.</p>
//     </div>

//     <div class="clause">
//         <h2>3. Share Transfer</h2>
//         <p><strong>Transfer:</strong> The Transferor shall transfer ownership of the Shares to the Transferee on a final and absolute basis, free from any encumbrances, liens, or third-party rights.</p>
//         <p><strong>Consideration:</strong> The Transferee shall pay the Purchase Price to the Transferor via bank transfer no later than .....</p>
//         <p><strong>Approval:</strong> This transfer is subject to the approval of the Company's Board of Directors and compliance with the Company's Articles of Association.</p>
//     </div>

//     <div class="clause">
//         <h2>4. Representations and Warranties</h2>
        
//         <p class="highlight">By the Transferor:</p>
//         <div class="indent">
//             <p>The Transferor represents and warrants that they legally own the Shares, which are duly registered in their name in the Company's records and the Dubai Department of Tourism and Economy.</p>
//             <p>The Transferor guarantees that the Shares are free from any third-party claims, encumbrances, or legal restrictions.</p>
//             <p>The Transferor affirms that they have the legal authority to execute this Agreement and will provide all necessary documentation to effect the transfer.</p>
//             <p>The Transferor warrants that the Company has no undisclosed debts or liabilities as of the transfer date.</p>
//         </div>
        
//         <p class="highlight">By the Transferee:</p>
//         <div class="indent">
//             <p>The Transferee represents that they have sufficient financial resources to pay the Purchase Price.</p>
//             <p>The Transferee acknowledges that they are acquiring the Shares for investment purposes and agree to comply with the Company's membership regulations.</p>
//             <p>The Transferee confirms that they have conducted due diligence on the legal and financial standing of the Company before signing this Agreement.</p>
//             <p>The Transferee agrees to bear all government fees associated with the transfer.</p>
//         </div>
//     </div>

//     <div class="clause">
//         <h2>5. Conditions Precedent</h2>
//         <ul>
//             <li>Approval of the Company's Board of Directors for the transfer.</li>
//             <li>Compliance with pre-emption rights (if any) as stated in the Company's Articles of Association or Shareholders' Agreement.</li>
//             <li>Either party may terminate this Agreement if the required approvals are not obtained within (60) days from the contract date.</li>
//         </ul>
//     </div>

//     <div class="clause">
//         <h2>6. Contractual Restrictions</h2>
        
//         <p class="highlight">1. Right of First Refusal (ROFR):</p>
//         <div class="indent">
//             <p>If the Transferee or any subsequent shareholder intends to sell or transfer any of their shares in the Company to a third party, they must first submit a written offer to the existing shareholders, specifying the number of shares offered, the price, and the terms of sale.</p>
//             <p>Existing shareholders shall have thirty (30) days from the date of receiving the written offer to exercise their right of first refusal.</p>
//             <p>If the shareholders do not exercise this right within the specified period, the selling party may proceed with the sale to the third party under the same terms and price offered to the shareholders.</p>
//         </div>
        
//         <p class="highlight">2. Non-Compete Obligation:</p>
//         <div class="indent">
//             <p>The Transferor agrees not to engage, directly or indirectly, in any business activity that competes with the Company's operations or invest in any competing entity within the United Arab Emirates or any market where the Company operates, for a period of seven (7) years from the effective date of this Agreement.</p>
//             <p>This restriction shall not apply to investments in publicly listed companies, provided that the ownership stake does not exceed 5% of the company's shares.</p>
//         </div>
        
//         <p class="highlight">3. Exclusion for Share Withdrawal Under Clause 8:</p>
//         <div class="indent">
//             <p>The Right of First Refusal outlined in this Clause shall not apply to any shares repurchased by the Company under the provisions of Clause 8 (Shareholder Withdrawal Rights).</p>
//         </div>
//     </div>

//     <div class="clause">
//         <h2>7. Shareholder Withdrawal Rights</h2>
        
//         <p class="highlight">1. Withdrawal Mechanism:</p>
//         <div class="indent">
//             <p>Any shareholder shall have the right to withdraw their capital by requiring the Company to repurchase their shares at Fair Market Value, subject to the following terms and conditions.</p>
//         </div>
        
//         <p class="highlight">2. Withdrawal Notice Requirements:</p>
//         <div class="indent">
//             <p>The shareholder must submit a written Withdrawal Notice to the Company's Board of Directors.</p>
//             <p>The Notice shall specify the following:</p>
//             <ul class="double-indent">
//                 <li>The number of shares to be repurchased</li>
//                 <li>The requested withdrawal dates, provided that such dates shall not be less than three (3) months from the date of the notice</li>
//                 <li>Supporting documentation evidencing share ownership</li>
//             </ul>
//         </div>
        
//         <p class="highlight">3. Notice Periods:</p>
//         <div class="indent">
//             <p>The notice period shall be three (3) months and shall commence upon the Company's formal acknowledgment of receipt of the Withdrawal Notice.</p>
//             <p>The Agreement may also be terminated at any time by mutual written agreement between the Parties.</p>
//         </div>
        
//         <p class="highlight">4. Valuation Process:</p>
//         <div class="indent">
//             <p>Within 15 business days of receiving the Withdrawal Notice, the Board shall appoint an independent UAE-licensed auditor.</p>
//             <p>The auditor shall determine the Fair Market Value using:</p>
//             <ul class="double-indent">
//                 <li>The average of the last three independent valuations</li>
//                 <li>The Company's most recent audited financial statements</li>
//                 <li>Market comparable for similar healthcare investments</li>
//                 <li>Valuation must be completed within 30 days of appointment</li>
//             </ul>
//         </div>
        
//         <p class="highlight">5. Payment Terms:</p>
//         <div class="indent">
//             <p>Payment shall be made in AED by bank transfer.</p>
//             <p>The full payment shall be made within fifteen (15) days from the end of the notice period.</p>
//         </div>
        
//         <p class="highlight">6. Conditions and Limitations:</p>
//         <div class="indent">
//             <p>The Company may refuse repurchase if it would:</p>
//             <ul class="double-indent">
//                 <li>Violate UAE capital maintenance requirements</li>
//                 <li>Endanger the Company's financial stability</li>
//                 <li>Contravene any existing financing covenants</li>
//                 <li>Maximum annual repurchase limit: 15% of total issued shares</li>
//             </ul>
//         </div>
        
//         <p class="highlight">7. Effect of Withdrawal:</p>
//         <div class="indent">
//             <ul>
//                 <li>Repurchased shares shall be automatically canceled.</li>
//                 <li>The shareholder's rights shall terminate and profit distributions shall immediately cease. The shareholder shall not be entitled to any distributions or profits resulting from the final business cycle.</li>
//                 <li>The Company shall update its commercial license and share register accordingly. All related fees and expenses shall be borne solely by the shareholder.</li>
//             </ul>
//         </div>
        
//         <p class="highlight">8. Dispute Resolution:</p>
//         <div class="indent">
//             <ul>
//                 <li>Any valuation disputes shall be resolved by the DIFC Courts</li>
//                 <li>The Company shall bear the costs of the initial valuation</li>
//                 <li>The challenging party bears costs of any subsequent valuations</li>
//             </ul>
//         </div>
//     </div>

//     <div class="clause">
//         <h2>8. Confidentiality</h2>
//         <p>Both parties agree not to disclose the details of this Agreement or use any confidential information related to the Company, including financial data, client lists, and business strategies, for any third party.</p>
//     </div>

//     <div class="clause">
//         <h2>9. Notices</h2>
//         <p>Any written notices shall be sent to the registered addresses of the parties as stated in this Agreement.</p>
//     </div>

//     <div class="clause">
//         <h2>10. Severability</h2>
//         <p>If any provision of this Agreement is found to be invalid or unenforceable under applicable laws, the remaining provisions shall remain in full force and effect.</p>
//     </div>

//     <div class="signature">
//         <div class="signature-box">
//             <p><strong>Transferor:</strong><br>
//             Ganeshwaran Vijayaratanam Vijayaratanam</p>
//             <p>_________________________</p>
//         </div>
//         <div class="signature-box">
//             <p><strong>Transferee:</strong><br>
//             ...........................</p>
//             <p>_________________________</p>
//         </div>
//     </div>
// </body>
// </html>`
        // var save = await model.getBankaccount(bankAccount)
        // if (securityOption.toUpperCase() !== "INSURANCE") {
        //     let html = securityOption.toUpperCase() === "SHARES" ? shareAgreement : notarizationAgreement
        //     var pdf = await createPdfWithPuppeteer(html, fullPath);
        // }
        let nomineeId = nomineeData ? nomineeData[0]?.n_id : createdNominee?.insertId
        let bankId = bankaccount[0]?.b_id
        let paymentMode = null
        if (payment_method === "wallet") {
            await model.UpdateWalletPayment(user_id, investment_amount)
            paymentMode = "through_wallet"
        } else {
            paymentMode = "through_bank"
        }
        var saveInvest = await model.AddInvest(user_id, date, investment_duration, investment_amount, percentage, return_amount, profit_model, securityOption, project_name, withdrawal_frequency, bankId, nomineeId, "cwi_invest", paymentMode)
        await sendNotificationToAdmins("investment", `${userdetails[0].u_name} requested to invest`)
        await notification.addNotification(user_id, userdetails[0].u_role, 'Investment', 'Investment added successfully')
        // 3️⃣  Public-facing URL path (served via Express or Nginx)
        const relativeUrl = securityOption.toUpperCase() === "SHARES" ? `/uploads/insurance/SHARE TRANSFER AGREEMENT.pdf` : securityOption.toUpperCase() === "INSURANCE" ? `/uploads/insurance/Insurance _CWI.pdf` : `/uploads/insurance/Financing Agreement CWI.pdf`

        // 4️⃣  Response
        return res.send({
            result: true,
            message: 'order success',
            contract_id: saveInvest.insertId,
            path: `${req.protocol}://${req.get('host')}${relativeUrl}`
        });

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        })
    }
}