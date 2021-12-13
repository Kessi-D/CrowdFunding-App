const notifier = require('node-notifier')

function ProjectCreatedMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"Your project will be reviewed",
        message: "Hello there!. Thank you for creating a project. Your project will be approved and you will be contacted via email. Thanks."
    })
}

function AdminCreatedMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"A site Manager",
        message: "Account Created successfully! Hey Admin. You created an account for an individual successfully."
    })
}

function AdminToReviewerMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"A project sent to a Reviewer",
        message: " A project is sent to a Reviewer to review."
    })
}


function ReviewerToAdminMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"Project Status",
        message: "You successfully sent an update of the project to the admin."
    })
}

function FinancialStatusMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"Project Financial Status",
        message: "You updated the financial status of this project."
    })
}

function ProjectApprovedMessage() {
    notifier.notify('Message');

    notifier.notify({
        title:"Project Status",
        message: "You sent an email to the Project Owner that his/her project has been approved."
    })
}

module.exports = {
    ProjectCreatedMessage, 
    AdminCreatedMessage, 
    ReviewerToAdminMessage, 
    FinancialStatusMessage,
    ProjectApprovedMessage,
    AdminToReviewerMessage
};