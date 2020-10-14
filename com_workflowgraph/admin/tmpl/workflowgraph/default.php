<?php
/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflowgraph
 *
 * @copyright   Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
\defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;

HTMLHelper::_('script', Uri::root() . "administrator/components/com_workflowgraph/media/lib/draw2d.js");
HTMLHelper::_('script', Uri::root() . "administrator/components/com_workflowgraph/media/lib/jquery.browser.js");
HTMLHelper::_('script', Uri::root() . "administrator/components/com_workflowgraph/media/lib/jquery.layout.js");
HTMLHelper::_('script', Uri::root() . "administrator/components/com_workflowgraph/media/lib/jquery-ui.js");
//HTMLHelper::_('script', Uri::root() . "administrator/components/com_workflowgraph/media/lib/jquery.js");
HTMLHelper::_('jquery.framework', false);

HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/canvas.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/toolbar.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/properties.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/StartNode.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/WorkflowStage.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/WorkflowTransition.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/AnyStage.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/DefaultTransition.js", ['version' => 'auto']);
HTMLHelper::_('script', Uri::root() . "/administrator/components/com_workflowgraph/media/js/WorkflowDragConnectionCreatePolicy.js", ['version' => 'auto']);

HTMLHelper::_('stylesheet', Uri::root() . "administrator/components/com_workflowgraph/media/css/workflow.css");

$newStageImage = Uri::root() . '/administrator/components/com_workflowgraph/media/img/new-stage.jpg';
$anyStageImage = Uri::root() . '/administrator/components/com_workflowgraph/media/img/any-stage.png';

?>
<div id="toolbar" style="height:100%; width: 15%; overflow-y: auto; float: left;border:solid red 2px;display:inline-block;">
	<div>
		<img id="stage" src="<?php echo $newStageImage; ?>" style="display:block; margin-left: auto; margin-right: auto; padding-top: 15px;" draggable="true" ondragstart="drag(event)"><br>
		<img id="anystage" src="<?php echo $anyStageImage; ?>" style="display:block; margin-left: auto; margin-right: auto; padding-top: 15px;" draggable="true" ondragstart="drag(event)"><br>
		<div>
			<button onclick="undo()">undo</button>
			<button onclick="redo()">redo</button>
			<button onclick="deleteNode()">delete</button>
		</div>
		<div>
			<button onclick="zoomin()">zoom in</button>
			<button onclick="resetZoom()">1:1</button>
			<button onclick="zoomout()">zoom out</button>
			<span id="currentZoom">100%</span>
		</div>
		<div>
			<button onclick="json()">json</button>
		</div>
		<form action="index.php?option=com_workflowgraph&view=confirmation&id=<?php echo $this->item->id;?>" method="post" id="adminForm" name="adminForm">
			<div id="form-buttons" class="btn-toolbar">
				<div class="btn-group">
					<button type="button" class="btn btn-primary" onclick="apply()">
						<span class="icon-ok"></span><?php echo JText::_('JAPPLY'); ?>
					</button>
				</div>
				<div class="btn-group">
					<button type="button" class="btn btn-primary" onclick="save()">
						<span class="icon-ok"></span><?php echo JText::_('JSAVE'); ?>
					</button>
				</div>
				<div class="btn-group">
					<button type="button" class="btn" onclick="cancel()">
						<span class="icon-cancel"></span><?php echo JText::_('JCANCEL'); ?>
					</button>
				</div>
			</div>
			<?php echo '<input id="token" type="hidden" name="' . JSession::getFormToken() . '" value="1" />'; ?>
			<input id="json" type="hidden" name="json"/>
			<?php echo JHtml::_('form.token'); ?>
			<input type="hidden" name="task" value=""/>
		</form>
		<div id="json">
		</div>
	</div>
</div>
<div id="graph" style="overflow: auto;float: left;white-space: nowrap;height:800px; width: 65%; border: solid blue 2px;display:inline-block;position:relative" >
    <div id="gfx_container" onselectstart="javascript:/*IE8 hack*/return false" style="height:1000px; border: solid green 2px;" ondrop="drop(event)" ondragover="allowDrop(event)" >
    </div>
</div>
<div id="properties-pane" style="height:100%; float: left;width: 20%; border: solid yellow 2px;display:inline-block;">
	<div id="workflowTitle">
	</div>
	<div id="properties">
	</div>
</div>