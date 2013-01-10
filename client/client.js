// Define Minimongo collections to match server/publish.js.Projects = new Meteor.Collection("projects");Issues = new Meteor.Collection("issues");Session.set("debug", false);  // set to true to show debug related infoSession.set("selected_pid", null);Session.set("selected_id", null);Session.set("selected_status_filter", null);Session.set("help_afterlogin", null);Session.set("help_filterbyissuestatus", null);Meteor.startup(function () {});Meteor.subscribe("projects", function () {  if ((!Session.get("selected_pid"))&&(Meteor.user())) {    var project = Projects.findOne({}, {sort: {projectTitle: 1}});    if (project) {      Session.set("selected_pid", project._id);    }  }});Meteor.autosubscribe(function () {  if (Session.get("selected_pid")) {    Meteor.subscribe("issues", Session.get("selected_pid"));  }});Handlebars.registerHelper("isProjectSelected", function() {  return Session.equals("selected_pid", null) ? false : true;});Handlebars.registerHelper("isDebug", function() {  return Session.get("debug");});Template.projectList.rendered = function() {  if (!Session.get("help_afterlogin")) {    toastr.info("", "Click on or create a project to begin!", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});    Session.set("help_afterlogin", true);  }};Template.projectList.events({});Template.projectList.helpers({  projects: function () {    return Projects.find({}, {sort: {projectTitle: 1}});  }});Template.project.events({  "click .project": function (event) {    resetIssue();    if (Session.get("selected_pid") != this._id) {      Session.set("selected_pid", this._id);      var project = Projects.findOne(Session.get("selected_pid"));      if (matchMedia("only screen and (max-width: 767px)").matches) {        $.scrollTo($("#projectInfoB"), 500, {offset: -10});      }      if (Session.get("debug")) $("#projectInfoA_Project_id").val(Session.get("selected_pid"));      $("#projectInfoA_ProjectTitle").val(project.projectTitle);    }    else {      resetProject();    }  }});Template.project.helpers({  selectedProject: function () {    return Session.equals("selected_pid", this._id) ? "selected" : "";  }});Template.projectInfoA.rendered = function() {  if (Session.get("selected_pid")) {    var project = Projects.findOne(Session.get("selected_pid"));    if (Session.get("debug")) $("#projectInfoA_Project_id").val(Session.get("selected_pid"));    $("#projectInfoA_ProjectTitle").val(project.projectTitle);  }}Template.projectInfoA.events({  "click #projectInfoA_CreateProject": function (event) {    if ($("#projectInfoA_ProjectTitle").val() != "") {      var insert_id = Projects.insert({projectTitle: $("#projectInfoA_ProjectTitle").val(), projectDescription: ""});      if (insert_id) {        Session.set("selected_pid", insert_id);        toastr.success("", "Project created", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});      }      else {        toastr.error("The project was not created", "Error", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});      }    }    else {      toastr.warning("", "Please enter a project title", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});    }  },  "click #projectInfoA_UpdateProject": function (event) {    if ($("#projectInfoA_ProjectTitle").val() != "") {      Projects.update(Session.get("selected_pid"), {$set: {projectTitle: $("#projectInfoA_ProjectTitle").val(), projectDescription: ""}});      toastr.success("", "Project updated", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});    }    else {      toastr.warning("", "Please enter a project title", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});    }  },  "click #projectInfoA_DeleteProject": function (event) {    if (Session.get("selected_pid") != null) {      $.blockUI({message: null, overlayCSS: {backgroundColor: '#fff'}});      var $toast = toastr.error("", "<div><button type='button' id='deleteProjectYesBtn' class='btn btn-primary'>Yes</button><button type='button' id='deleteProjectNoBtn' class='btn' style='margin: 0 8px 0 8px'>No</button> Delete Project?</div>", {fadeIn: 250, fadeOut: 250, timeOut: 0, extendedTimeOut: 0, onclick: null, tapToDismiss: false});      if ($toast.find('#deleteProjectYesBtn').length) {        $toast.delegate('#deleteProjectYesBtn', 'click', function () {          resetIssue();          var projectIssues = Issues.find({_pid: Session.get("selected_pid")});          projectIssues.forEach(function (issue) {            Issues.remove({_id: issue._id});          });          Projects.remove({_id: Session.get("selected_pid")});          toastr.success("", "Project deleted", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});          resetProject();          $.unblockUI();          $toast.remove();        });      }      if ($toast.find('#deleteProjectNoBtn').length) {        $toast.delegate('#deleteProjectNoBtn', 'click', function () {          $.unblockUI();          $toast.remove();        });      }    }  },  "click #projectInfoA_CancelProject": function (event) {    resetIssue();    resetProject();  }});Template.projectInfoA.helpers({  selectedProject: function () {    return Session.equals("selected_pid", null) ? false : true;  }});Template.projectInfoB.rendered = function() {  $("#projectInfoB").waypoint("sticky");}Template.projectInfoB.events({});Template.projectInfoB.helpers({  project: function () {    var project = Projects.findOne(Session.get("selected_pid"));    if (project) {      return project;    }  }});Template.issueListFilters.events({  "click #issueListFilters_StatusClosed": function () {    if (!Session.get("help_filterbyissuestatus")) {      toastr.info("", "You are filtering issues by a particular status. To remove the filter, click again on the filter you just selected, or select another filter.", {fadeIn: 250, fadeOut: 250, timeOut: 10000, extendedTimeOut: 250});      Session.set("help_filterbyissuestatus", true);    }    resetIssue();    Session.set("selected_status_filter", Session.equals("selected_status_filter", "Closed") ? null : "Closed");  },  "click #issueListFilters_StatusDuplicate": function () {    if (!Session.get("help_filterbyissuestatus")) {      toastr.info("", "You are filtering issues by a particular status. To remove the filter, click again on the filter you just selected, or select another filter.", {fadeIn: 250, fadeOut: 250, timeOut: 10000, extendedTimeOut: 250});      Session.set("help_filterbyissuestatus", true);    }    resetIssue();    Session.set("selected_status_filter", Session.equals("selected_status_filter", "Duplicate") ? null : "Duplicate");  },  "click #issueListFilters_StatusOpen": function () {    if (!Session.get("help_filterbyissuestatus")) {      toastr.info("", "You are filtering issues by a particular status. To remove the filter, click again on the filter you just selected, or select another filter.", {fadeIn: 250, fadeOut: 250, timeOut: 10000, extendedTimeOut: 250});      Session.set("help_filterbyissuestatus", true);    }    resetIssue();    Session.set("selected_status_filter", Session.equals("selected_status_filter", "Open") ? null : "Open");  },  "click #issueListFilters_StatusOutOfScope": function () {    if (!Session.get("help_filterbyissuestatus")) {      toastr.info("", "You are filtering issues by a particular status. To remove the filter, click again on the filter you just selected, or select another filter.", {fadeIn: 250, fadeOut: 250, timeOut: 10000, extendedTimeOut: 250});      Session.set("help_filterbyissuestatus", true);    }    resetIssue();    Session.set("selected_status_filter", Session.equals("selected_status_filter", "Out Of Scope") ? null : "Out Of Scope");  }});Template.issueListFilters.helpers({  selectedStatusFilter: function (whatStatus) {    return Session.equals("selected_status_filter", whatStatus) ? "btn-inverse" : "";  }});Template.issueList.events({});Template.issueList.helpers({  issues: function () {    var selected_pid = Session.get("selected_pid");    if (!selected_pid) {      return {};    }    var query = {_pid: selected_pid};        var selectedStatusFilter = Session.get("selected_status_filter");    if (selectedStatusFilter) {      query.issueStatus = selectedStatusFilter;    }    return Issues.find(query, {sort: {issueNumber: 1}});  }});Template.issue.events({  "click a.issueStatus": function (event) {    event.preventDefault();    Session.set("selected_id", this._id);    Issues.update(Session.get("selected_id"), {$set: {issueStatus:event.target.text}});    resetIssue();  },  "click tr.issue": function (event) {    if (event.target.nodeName != "A") {      if (Session.get("selected_id") != this._id) {        Session.set("selected_id", this._id);        var issue = Issues.findOne(Session.get("selected_id"));        if (matchMedia("only screen and (max-width: 979px)").matches) {          $.scrollTo($("#issueInfo"), 500, {offset: -10});        }        else {          $.scrollTo($("#issueInfo"), 500, {offset: -51});        }        if (Session.get("debug")) $("#issueInfo_Issue_id").val(Session.get("selected_id"));        $("#issueInfo_IssueNumber").val(issue.issueNumber);        $("#issueInfo_issueCreatedTime").val((new Date(issue.issueCreatedTime)).f("MM/dd/yyyy HH:mm a"));        $("#issueInfo_IssueTitle").val(issue.issueTitle);        $("#issueInfo_IssueDescription").val(issue.issueDescription);      }      else {        resetIssue();      }    }  }});Template.issue.helpers({  selectedIssue: function () {    return Session.equals("selected_id", this._id) ? "selected" : "";  },  statusStyle: function () {    switch (this.issueStatus) {    case "Closed":      return "closed";      break;    case "Duplicate":      return "duplicate";      break;    case "Open":      return "open";      break;    case "Out Of Scope":      return "out-of-scope";      break;    default:      return "";      break;    }  },  formatMilliseconds: function (milliseconds) {    return (new Date(milliseconds)).f("MM/dd/yyyy HH:mm a")  }});Template.issueInfo.rendered = function() {  // If there isn't enough vertical height for the Issue Info div, then we won't make it sticky  var screenMatch = "only screen and (min-width: 768px) and (min-height: " + ($("#issueInfo").height() + 61) + "px)";  if (matchMedia(screenMatch).matches) {    $("#issueInfo").waypoint("sticky");  }}Template.issueInfo.events({  "click #issueInfo_CreateIssue": function (event) {    if ($("#issueInfo_IssueTitle").val() != "") {      var issueCreatedTime = (new Date()).getTime();      var query = {_pid: Session.get("selected_pid")};      var lastIssue = Issues.findOne(query, {sort: {issueNumber: -1}});      var lastIssueNumber = 0;      if (lastIssue) {        lastIssueNumber = parseInt(lastIssue.issueNumber);      }            var insert_id = Issues.insert({_pid: Session.get("selected_pid"), issueNumber: (lastIssueNumber + 1), issueTitle: $("#issueInfo_IssueTitle").val(), issueDescription: $("#issueInfo_IssueDescription").val(), issueStatus: "Open", issueCreatedTime: issueCreatedTime});      if (insert_id) {        toastr.success("", "Issue created", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});      }      else {        toastr.error("The issue was not created", "Error", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});      }      resetIssue();    }    else {      toastr.warning("", "Please enter an issue title", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});    }  },  "click #issueInfo_UpdateIssue": function (event) {    if (Session.get("selected_id") != null) {      if ($("#issueInfo_IssueTitle").val() != "") {        Issues.update(Session.get("selected_id"), {$set: {issueTitle: $("#issueInfo_IssueTitle").val(), issueDescription: $("#issueInfo_IssueDescription").val()}});        toastr.success("", "Issue updated", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});        resetIssue();      }      else {        toastr.warning("", "Please enter an issue title", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});      }    }  },  "click #issueInfo_DeleteIssue": function (event) {    if (Session.get("selected_id") != null) {      $.blockUI({message: null, overlayCSS: {backgroundColor: '#fff'}});      var $toast = toastr.error("", "<div><button type='button' id='deleteIssueYesBtn' class='btn btn-primary'>Yes</button><button type='button' id='deleteIssueNoBtn' class='btn' style='margin: 0 8px 0 8px'>No</button> Delete Issue?</div>", {fadeIn: 250, fadeOut: 250, timeOut: 0, extendedTimeOut: 0, onclick: null, tapToDismiss: false});      if ($toast.find('#deleteIssueYesBtn').length) {        $toast.delegate('#deleteIssueYesBtn', 'click', function () {          $.unblockUI();          Issues.remove({_id: Session.get("selected_id")});          toastr.success("", "Issue deleted", {fadeIn: 250, fadeOut: 250, timeOut: 3000, extendedTimeOut: 250});          resetIssue();          $toast.remove();        });      }      if ($toast.find('#deleteIssueNoBtn').length) {        $toast.delegate('#deleteIssueNoBtn', 'click', function () {          $.unblockUI();          $toast.remove();        });      }    }  },  "click #issueInfo_CancelIssue": function (event) {    resetIssue();  }});Template.issueInfo.helpers({  selectedIssue: function () {    return Session.equals("selected_id", null) ? false : true;  }});function resetProject() {  Session.set("selected_pid", null);  if (Session.get("debug")) $("#projectInfoA_Project_id").val("");  $("#projectInfoA_ProjectTitle").val("");};function resetIssue() {  Session.set("selected_id", null);  if (Session.get("debug")) $("#issueInfo_Issue_id").val("");  $("#issueInfo_IssueNumber").val("");  $("#issueInfo_issueCreatedTime").val("");  $("#issueInfo_IssueTitle").val("");  $("#issueInfo_IssueDescription").val("");};