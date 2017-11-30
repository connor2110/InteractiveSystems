$(document).ready(function() {
	var titleText = $("#login-text");
	var controlRegister = $("#control-register");
	var regBtnText = $("#control-register-text");
	var logBtnText = $("#control-login-text");
	
	controlRegister.click(function() {
		if (titleText.text() == "Register:") {
			titleText.text("Login:");
			regBtnText.text("Register");
			logBtnText.text("Login");
		}
		else {
			titleText.text("Register:");
			regBtnText.text("Login");
			logBtnText.text("Submit");
		}
	});
});

