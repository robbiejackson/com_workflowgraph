/*
 * This file contains the js code associated with the properties elements in the right hand properties pane
 * The functions below are used to create the input elements shown in the properties pane and handle the associated user inputs
 */

/*
 * Function to create the input element for capturing the Transition status 
 */
function createTransitionStatus(figure) {
	const userdata = figure.getUserData();
	var status = "1";
	if (userdata !== undefined && userdata.published !== undefined) {
		status = userdata.published;
	}
	var html = '<label for="published">Status:</label>';
	html += '<select name="TransitionStatus" id="TransitionStatus" onchange="handleTransitionStatus()">';
	html += '<option value="1">Enabled</option>';
	html += '<option value="0"' + (status == "0" ? 'selected' : '') + '>Disabled</option>';
	html += '<option value="-2"' + (status == "-2" ? 'selected' : '') + '>Trashed</option>';
	html += '</select>';
	return html;
}
/*
 * Function called when the transition status is changed within the select element
 * The updated status is stored within the userData of the node
 */
function handleTransitionStatus() {
	const status = document.getElementById("TransitionStatus").value;
	var node = canvas.getPrimarySelection();
	if (node instanceof WorkflowTransition) {
		node.updateUserData({published: status});
	}
}

/*
 * Function to create the textarea input element for capturing the Transition description 
 */
function createTransitionDescription(figure) {
	const userdata = figure.getUserData();
	var description = "";
	if (userdata !== undefined && userdata.description !== undefined) {
		description = userdata.description;
	}
	var html = "<br><p>Transition Description - press Tab after entering your text.</p>";
	html += '<textarea id="TransitionDescription" name="TransitionDescription" rows="4" onblur="handleTransitionDescription()">';
	html += description + '</textarea>';
	return html;
}
/*
 * Function called when the transition description is changed within the select element
 * The updated description is stored within the userData of the node
 */
function handleTransitionDescription() {
	const description = document.getElementById("TransitionDescription").value;
	var node = canvas.getPrimarySelection();
	if (node instanceof WorkflowTransition) {
		node.updateUserData({description: description});
	}
}

/*
 * Function to create the input element for capturing the Transition action Publishing State 
 */
function createTransitionActionPublishing(figure) {
	const userdata = figure.getUserData();
	var publishing = "";
	if (userdata !== undefined && userdata.actionPublishing !== undefined) {
		publishing = userdata.actionPublishing;
	}
	var html = '<br><p>Transition Actions<br>Define the state an item should be set, when executing this transition</p><br>';
	html += '<label for="TransitionActionPublishing">Publishing state:</label>';
	html += '<select name="TransitionActionPublishing" id="TransitionActionPublishing" onchange="handleTransitionActionPublishing()">';
	html += '<option value="">- Do not change -</option>';
	html += '<option value="1"' + (publishing == "1" ? 'selected' : '') + '>Published</option>';
	html += '<option value="0"' + (publishing == "0" ? 'selected' : '') + '>Unpublished</option>';
	html += '<option value="2"' + (publishing == "2" ? 'selected' : '') + '>Archived</option>';
	html += '<option value="-2"' + (publishing == "-2" ? 'selected' : '') + '>Trashed</option>';
	html += '</select>';
	return html;
}
/*
 * Function called when the transition Transition action Publishing State  is changed within the select element
 * The updated publishing value is stored within the userData of the node
 */
function handleTransitionActionPublishing() {
	const publishing = document.getElementById("TransitionActionPublishing").value;
	var node = canvas.getPrimarySelection();
	if (node instanceof WorkflowTransition) {
		node.updateUserData({actionPublishing: publishing});
	}
}

/*
 * Function to create the input element for capturing the Stage status 
 */
function createStageStatus(figure) {
	const userdata = figure.getUserData();
	var status = "1";
	if (userdata !== undefined && userdata.published !== undefined) {
		status = userdata.published;
	}
	var html = '<label for="published">Status:</label>';
	html += '<select name="StageStatus" id="StageStatus" onchange="handleStageStatus()">';
	html += '<option value="1">Enabled</option>';
	html += '<option value="0"' + (status == "0" ? 'selected' : '') + '>Disabled</option>';
	html += '<option value="-2"' + (status == "-2" ? 'selected' : '') + '>Trashed</option>';
	html += '</select>';
	return html;
}
/*
 * Function called when the stage status is changed within the select element
 * The updated status is stored within the userData of the node
 */
function handleStageStatus() {
	const status = document.getElementById("StageStatus").value;
	var node = canvas.getPrimarySelection();
	if (node instanceof WorkflowStage) {
		node.updateUserData({published: status});
	}
}

/*
 * Function to create the textarea input element for capturing the Stage description 
 */
function createStageDescription(figure) {
	const userdata = figure.getUserData();
	var description = "";
	if (userdata !== undefined && userdata.description !== undefined) {
		description = userdata.description;
	}
	var html = "<br><p>Stage Description - press Tab after entering your text.</p>";
	html += '<textarea id="StageDescription" name="StageDescription" rows="4" onblur="handleStageDescription()">';
	html += description + '</textarea>';
	return html;
}
/*
 * Function called when the Stage description is changed within the select element
 * The updated description is stored within the userData of the node
 */
function handleStageDescription() {
	const description = document.getElementById("StageDescription").value;
	var node = canvas.getPrimarySelection();
	if (node instanceof WorkflowStage) {
		node.updateUserData({description: description});
	}
}
