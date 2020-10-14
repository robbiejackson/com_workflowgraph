<?php
/**
 * @package     Joomla.Administrator
 * @subpackage  com_workflowgraph
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Workflowgraph\Administrator\View\Workflowgraph;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Toolbar\ToolbarHelper;

class HtmlView extends BaseHtmlView
{
	public function display($tpl = null)
	{
		$this->item = $this->get('Item');
		if ($this->item)
		{
			$document = Factory::getDocument();
			$document->addScriptOptions('graph', $this->item->graph);
			$document->addScriptOptions('title', $this->item->title);
			$document->addScriptOptions('defaultStageId', $this->item->defaultStageId);
			if (JDEBUG) 
			{
				$document->addScriptOptions('jdebug', true);
			}
		}

		return parent::display($tpl);
	}
}