<?php

/* * *************************************************************
 *  Copyright notice
 *
 *  (c) 2017 Sebastian Schmal - INGENIUMDESIGN <info@ingeniumdesign.de>
 *  All rights reserved
 *
 *  This file is part of the "indexed_search" Extension for TYPO3 CMS.
 *
 *  For the full copyright and license information, please read the
 *  LICENSE file that was distributed with this source code.
 *
 * ************************************************************* */

namespace ID\indexedSearchAutocomplete\Controller;


/**
 * EntryController
 */
class SearchController extends \TYPO3\CMS\IndexedSearch\Controller\SearchController {


    /**
     * @param \TYPO3\CMS\Core\TypoScript\TypoScriptService $typoScriptService
     */
    public function injectTypoScriptService(\TYPO3\CMS\Core\TypoScript\TypoScriptService $typoScriptService)
    {
        $this->typoScriptService = $typoScriptService;
    }

    /**
     * action search
     *
     * @param array $search
     *
     * @return string
     */
    public function searchAction($search = []) {

        if (!$this->settings) {
            $setting = $this->configurationManager->getConfiguration(
                \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
            );
            $settings = $setting['plugin.']['tx_indexedsearch.']['settings.'];
            $this->settings = $this->typoScriptService->convertTypoScriptArrayToPlainArray($settings);
        }

        $arg = $_REQUEST;

        $search = [
            '_sections '=> '0',
            '_freeIndexUid' => '_',
            'pointer' => '0',
            'ext' => '',
            'searchType' => '1',
            'defaultOperand' => '0',
            'mediaType' => -'1',
            'sortOrder' => 'rank_flag',
            'group' => '',
            'languageUid' => -'1',
            'desc' => '',
            'numberOfResults' => $arg['mr'],
            'extendedSearch' => '',
            'sword' => $arg['s'],
            'submitButton' => 'Suchen',
        ];
        parent::searchAction($search);

        $this->view->assign('mode', $arg['m']);
    }

}
