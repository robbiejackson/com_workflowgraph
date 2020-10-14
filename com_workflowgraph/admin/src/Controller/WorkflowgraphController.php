<?php
/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflowgraph
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Workflowgraph\Administrator\Controller;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\MVC\Controller\FormController;
use Joomla\Component\Workflow\Administrator\Table\WorkflowTable;
use Joomla\CMS\Response\JsonResponse;
use Joomla\CMS\Router\Route;

class WorkflowgraphController extends FormController
{

	public function save($key = null, $urlVar = null)
	{
		$this->checkToken();
		$data  = $this->input->post->get('json', '', 'string');
		$model = $this->getModel();
		$result = $model->save($data);
		$workflowsListPage = Route::_('index.php?option=com_workflow&view=workflows&extension=' . $model->getWorkflowExtension(), false);
		$this->setRedirect($workflowsListPage);
	}
	
	public function ajaxsave()
	{
		$this->checkToken();
		$data  = $this->input->post->get('json', '', 'string');
		$model = $this->getModel();
		$result = $model->save($data);
		echo new JsonResponse($result);
	}
	
	public function cancel($key = null)
	{
		$this->checkToken();
		$model = $this->getModel();
		$workflowsListPage = Route::_('index.php?option=com_workflow&view=workflows&extension=' . $model->getWorkflowExtension(), false);
		$this->setRedirect($workflowsListPage, "Cancelled ok", "message");
	}
}