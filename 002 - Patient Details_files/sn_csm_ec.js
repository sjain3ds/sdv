/*! RESOURCE: /scripts/sn_csm_ec.js */
var SN_CSM_EC = (function() {
    var proactiveEventListenersAdded = false;
    var proactiveHelpOpen = false;
    var initialUserActivityDetected = false
    var isProactiveAnimationRunning = false;
    var proactiveEventListenerFunc;
    var proactiveHelpDismissThreshold = 3;
    var contextualRecommendationsShown = false, persistManualRecommendations = false, blockManualRecommendations = false, proactiveClosedAfterRefresh = false;
    var isCalledFromDeepLinking = true;
    var animationTooltipClosed = false;
    var proactiveTimeout, animationTimeout;
    var recommendationsFromAnimation = false;
    var moduleRespData = {};
    var isProactiveHelpDismissed = false;
    var enableRecommendations = true;
    var IdpIframeEmbeddingEnabled=false;
    var proactiveAnimationDuration = 20;
    var IFRAME_SRC = "";
    var IFRAME_LANG = "";
    var IFRAME_LOGOUT_SRC = "";
    var IFRAME_DOCOUT_WIDTH = "420px";
    var IFRAME_DOCIN_WIDTH = "400px";
    var IFRAME_HEIGHT = "700px";
    var FLOATING_BUBBLE_SIZE = "60";
    var ID_TOKEN = "";
    var CONFIG_ID = "";
    var PORTAL_ID = "";
    var EC_ORIGIN = "";
    var CONTEXT = "";
    var IFRAME_LAUNCHER_ICON_SRC = "";
    var IFRAME_CLOSE_ICON_SRC = "";
    var STORAGE_LAUNCHER_STATUS_KEY = "ec.launcher_last_status";
    var STORAGE_LAST_NAVIGATION_DATA_KEY = "ec.last_nav_data";
    var IFRAME_V_PADDING = "10";
    var IFRAME_H_PADDING = "50";    
    var MESSENGER_LOCATION = "right";
    var ICON_COLOR = "#4F52BE";
    var LOGIN_MSG = "Please wait, you are being logged in...";
    var POPUP_SHOW = false;
    var NOTIFICATION_COUNT = '';
    var NOTIFICATION_COUNT_BG_COLOR = '#B5DDE5';
    var NOTIFICATION_COUNT_TEXT_COLOR = "#000000";
    var IS_WIDGET_COLLAPSED = true;
    var NEW_CASE_CAT_ITEM_SYS_ID = "097aa7701d7da410f877631e17be4ede";
    var TECHNICIAN_APPOINTMENT_ITEM_SYS_ID = "19b5cede07642010f55596fe0ad3003c";
    var CHAT_FEATURE = "CHAT";
    var HOME_FEATURE = "HOME";
    var CHAT_TOPIC_VAR_SUBSTRING = "sysparm_";
    var LAUNCHER_ICON_WIDTH = 24;
    var LAUNCHER_ICON_HEIGHT = 24;
    var LAUNCHER_ICON_MARGIN_LEFT = 12;
    var LAUNCHER_ICON_MARGIN_TOP = 12;
    var LAUNCHER_ICON_TOOLTIP = "Launch the messenger";
    var CLOSE_ICON_TOOLTIP = "Close the messenger";
    var ROLES_NEEDING_FEATURES = ["NEW_CASE", "NEW_WORK_ORDER"];
    var USER_TYPE = '';
    var CONTEXT_FEATURE_MAP = {
        "PROACTIVE_SEARCH": {
            static: {
                "id": "proactive_search_page",
            },
            params: {
            }
        },
        "PROACTIVE_CHAT": {
            static: {
                "id": "proactive_chat_page",
            },
            params: {
            }
        },
        "PROACTIVE_RECOMMENDATIONS": {
            static: {
                "id": "recommendations",
                "spa": "1",
                "called_proactively": "true",
            },
            params: {
                'q': 'q',
            }
        },
        "CONTEXTUAL_RECOMMENDATIONS": {
            static: {
                "id": "recommendations",
                "spa": "1"
            },
            params: {
                'q': 'q',
            }
        },
        "CHAT": {
            static: {
                "id": "em_chat",
                "context_load": "chat"
            },
            params: {
                "case_id": "sysparm_case_sys_id",
                "topic_id": "sysparm_default_topic",
                "language": "sysparm_requester_session_language"
            }
        },
        "WALKUP_CONFIRM": {
            static: {
                "id": "ec_walkup_confirmation",
                "isAppointment": "existing"
            },
            params: {
                "token": "token",
                "confirm": "confirm"
            }
        },
        "WALKUP_ACCESS": {
            static: {
                "id": "ec_csm_guest_walkup_otp_verify",
                "isAppointment": "existing"
            },
            params: {
                "token": "token",
                "access": "access"
            }
        },
        "CASE" : {
            static: {
                "id": "ec_case_details"
            },
            params: {
                "table": "table",
                "sys_id": "sys_id"
            }
        },
        "WORK_ORDER" : {
            static: {
                "id": "em_task_details"
            },
            params: {
                "table": "table",
                "sys_id": "sys_id"
            }
        },
        "WALKUP_REG" : {
            static: {
                "id": "ec_walkup_confirmation",
                "isAppointment": "existing"
            },
            params: {
                "sys_id": "wu_apt"
            }
        },
        "NEW_CASE": {
            static: {
                "id": "sc_cat_item",
                "sys_id": NEW_CASE_CAT_ITEM_SYS_ID
            },
            params: {}
        },
        "CASE_LIST": {
            static: {
                "id": "em_case_list"
            }, 
            params: {}
        },
        "VIEW_ARTICLE": {
            static: {
                "id": "kb_article_view"
            },
            params: {
                "sys_kb_id": "sys_kb_id",
                "sys_id": "sys_id",
                "sysparm_article":  "sysparm_article"
            }
        },
        "SEARCH": {
            static: {
                "id": "search",
                "spa": "1"
            },
            params: {
                "q": "q"
            }
        },
        "CASE_SEARCH": {
            static: {
                "id": "ec_search",
                "spa": "1",
                "t": "ec_case"
            },
            params: {
                "q": "q"
            }
        },
        "CATALOG_ITEM": {
            static: {
                "id": "sc_cat_item"
            },
            params: {
                "sys_id": "sys_id"
            }
        },
        "NEW_APPOINTMENT": {
            static: {
                "id": "ec_create_guest_walkup"
            },
            params: {}
        },
        "NEW_WORK_ORDER": {
            static: {
                "id": "em_appointment_booking",
                "sys_id": TECHNICIAN_APPOINTMENT_ITEM_SYS_ID
            },
            params: {}
        },
        "HOME": {
            static: {},
            params: {}
        }
    }
    var launcher, baseUrl, widgetFrame, widgetWrapper, popupObjectReference, configResolver, isLoggedInUser = false, floatingBubble, closerIcon, isLastDockStateOUT = false, loadLastURL = true, loginMsgSection, htmlPage, audioNotification, isHomeFeature = false, popupClosed = false, isIntermediatePageOpen = false, prevPageBeforePopup = '';
    var onLoadConfig = new Promise(function(success) {
        return configResolver = success;
    });
    var fetchTokenCallback = function() {
        return Promise.resolve();
    };
    var contextFunction = function (){return {}};
    function resetHomeFeatureFlag() {
        if(isHomeFeature)
            isHomeFeature = !isHomeFeature;
    }
    function addFeatureContext(featureContext) {
        if(!featureContext || !featureContext.feature || !featureContext.static) throw new Error("Unable to add new feature context");
        var contextObj = {};
        var featureName = featureContext.feature;
        contextObj.static = featureContext.static;
        contextObj.params = featureContext.params? featureContext.params: {};
        CONTEXT_FEATURE_MAP[featureName] = contextObj;    
    }
    function getAdditionalUrlParams(featureObject){
        var additionalParams = '';
        if (featureObject.feature== 'NEW_WORK_ORDER' && USER_TYPE == 'consumer')
            additionalParams = 'has_access=false';
        return additionalParams;
    }
    function prepareContext(){
        try{
            var featureObject = contextFunction;
            var urlParam = "";
            var featureData = CONTEXT_FEATURE_MAP[featureObject.feature];
            if(!featureData) throw new Error("Unable to identify feature " + featureObject.feature);
            
            isCalledFromDeepLinking = true;
            if(featureObject.feature == HOME_FEATURE) {
                isHomeFeature = true;
            }
            var contextObject = {};
            Object.keys(featureData.static).forEach(function(key){
                contextObject[key] = featureData.static[key];
            });
            Object.keys(featureObject.params).forEach(function(key){
                var propKey = featureData.params[key];
                if(propKey) 
                    contextObject[propKey] = featureObject.params[key];
                else {
                    if(featureObject.feature == CHAT_FEATURE && key.startsWith(CHAT_TOPIC_VAR_SUBSTRING))
                        contextObject[key] = featureObject.params[key];
                    else throw new Error(key + " property is not registered in feature " + featureObject.feature);
                }
            });
            var urlParamArr = [];
            var additionalUrlParams = getAdditionalUrlParams(featureObject);
            if(additionalUrlParams)
                urlParamArr.push(additionalUrlParams);
            Object.keys(contextObject).forEach(function(key){
                if(contextObject[key] !== '') {
                    urlParamArr.push(encodeURIComponent(key) + "=" + encodeURIComponent(contextObject[key]));
                }
            });
            if(featureObject.feature != CHAT_FEATURE)
                urlParamArr.push(encodeURIComponent("context_load") + "=" + encodeURIComponent("true"));
            urlParam = urlParamArr.join("&");
            urlParam && (loadLastURL = false);
        }catch(e){            
            urlParam = "";
        }finally{            
            CONTEXT = urlParam ? "?" + urlParam : CONTEXT;
        };
    }
    function addAttribute(param, index, array) {
        var keyVal = param.split("=");
        if (keyVal.length == 2)
            this[keyVal[0]] = keyVal[1];
    }
    function loadFeature(){
        var queryString = String(window.location.search).substring(1);
        var queryParams = queryString.split("&");
        var returnVal = {
            feature: "",
            openOnLoad: true,
            params: {}
        };
        queryParams.forEach(addAttribute, returnVal.params);
        
        if(returnVal.params.table == "sn_customerservice_case"){
            returnVal.feature = "CASE";
            trimFeatureObject(returnVal.params, ["sys_id","table"] ,returnVal.feature);
        }
        else if (returnVal.params.table == "wm_order") {  
            returnVal.feature = "WORK_ORDER";
            trimFeatureObject(returnVal.params,["sys_id","table"] ,returnVal.feature);
        }
        else if(returnVal.params.table == "wu_appointment"){
            returnVal.feature = "WALKUP_REG";
            trimFeatureObject(returnVal.params, ["sys_id"], returnVal.feature);
        }
        else if (returnVal.params && returnVal.params.token){
            returnVal.feature = "WALKUP_CONFIRM";
            if(!returnVal.params.confirm && returnVal.params.access)
                returnVal.feature = "WALKUP_ACCESS";
        }
        else if(CONTEXT_FEATURE_MAP[returnVal.params.feature]) {
            returnVal.feature = returnVal.params.feature;
            trimFeatureObject(returnVal.params, Object.keys(CONTEXT_FEATURE_MAP[returnVal.params.feature].params), returnVal.feature);
        }
        if (queryString.includes('feature=') && CONTEXT_FEATURE_MAP[returnVal.feature] ){
            isCalledFromDeepLinking = true;
            isIntermediatePageOpen = true;
        }
        return returnVal.params ? returnVal : {};
    }
    function trimFeatureObject(jsonObj, keysToRetain, feature){
        for(var property in jsonObj){
            if(jsonObj.hasOwnProperty(property)){
                var keyString = property + "";
                if((feature != CHAT_FEATURE && keysToRetain.indexOf(keyString) == -1) || (feature == CHAT_FEATURE && !keyString.startsWith(CHAT_TOPIC_VAR_SUBSTRING) && keysToRetain.indexOf(keyString) == -1))
                    delete jsonObj[property];
            }
        }
    }
    function isRolesNeededBeforeInit(config){
        if (config.loadFeature && ROLES_NEEDING_FEATURES.includes(config.loadFeature.feature)){
            return true;
        } else {
            return false;
        }
    }
    function setConfig(configData) {
        if (configData) {
            if (configData.guestWalkupBaseUrl)
                baseUrl = configData.guestWalkupBaseUrl;
            fetchTokenCallback = configData.tokenCallBack;
            if(configData.getAISRecommendationsContext)
                getProactiveRecommendationsQueryterm = configData.getAISRecommendationsContext;
            if(configData.enableRecommendations!= null && configData.enableRecommendations == false){
                enableRecommendations = false;
            }
            if(configData && configData.IdpIframeEmbeddingEnabled){
                IdpIframeEmbeddingEnabled=configData.IdpIframeEmbeddingEnabled;
            }
            contextFunction = configData.loadFeature || contextFunction;
            prepareContext();
            var ecDetails = configData.moduleID.split("#");
            var ecOrigin = ecDetails[0];
EC_ORIGIN = ecOrigin[ecOrigin.length - 1] == "/" ? ecOrigin.slice(0, ecOrigin.length - 1) : ecOrigin;
            CONFIG_ID = ecDetails[1];
            if(configData.setLang || configData.lang){
                IFRAME_LANG = '';
                if(configData.setLang)
                    IFRAME_LANG = configData.setLang();
                if(IFRAME_LANG == undefined || IFRAME_LANG == null || IFRAME_LANG == '')
                    IFRAME_LANG = configData.lang;
            }
            return loadConfig();
        } else {
            throw new Error("Module ID is mandatory");
        }
    }
    function loadConfig() {
        return fetchRequest({
            method: "GET",
url: EC_ORIGIN + "/api/sn_csm_ec/engagement_center_api/modules/" + CONFIG_ID + (IFRAME_LANG != '' ? "?lang=" + IFRAME_LANG : "")
        }).then(function(response){
            if (response){
            var config = JSON.parse(response);
                if (config.result && config.result.portal){
                    if (config.result.guest_exp === "true")
                        config.result.sso_medium = "none";
                    else if (config.result.guest_exp === "false" && fetchTokenCallback)
                        config.result.sso_medium = "OIDC";
                    else
                        config.result.sso_medium = "SAML";
                    configResolver(config.result.sso_medium);
            PORTAL_ID = config.result.portal;
                    var lastVisitedUrl = getLastVisitedUrl();
                    if(isHomeFeature){
IFRAME_SRC = EC_ORIGIN + "/" +PORTAL_ID;
                        if(IFRAME_LANG != ''){
                            IFRAME_SRC = IFRAME_SRC + '?lang=' + IFRAME_LANG;
                            IFRAME_SRC = IFRAME_SRC + '&context_load=true';
                        } else {
                            IFRAME_SRC = IFRAME_SRC + CONTEXT;
                        }
                    }
                    else if(!!lastVisitedUrl && loadLastURL){
                        IFRAME_SRC = lastVisitedUrl;
                        isLastUrlIntermediate();
                        setLangParamOnLastVisitedUrl();
                    }
                    else{
                        setIframeSrcOnLang();
                    }
IFRAME_LOGOUT_SRC = EC_ORIGIN + "/logout.do?sysparm_goto_url=" + EC_ORIGIN + "/" +PORTAL_ID;
                    moduleRespData = config;
                    manualRecommendationsCheck();
                    customizeMessenger(config);
            return config;
                }
            }
        }, function(){
            throw new Error("Incorrect Module ID provided");
        })
    }
    
    function closeToolTipWrapperFunc(){
        animationTooltipClosed = true;
        stopAnimation();
        deregisterProactiveHelpEventListeners();
        storeProactivehelpDismissActivity();
    }
    function closeToolTip() {
        var tooltipElem = document.getElementById('proactive-animation-tooltip');
        if (tooltipElem) {
            tooltipElem.style.visibility = 'hidden';
            tooltipElem.setAttribute('class', '');
        }
    }
    function showToolTip() {
        var tooltipElem = document.getElementById('proactive-animation-tooltip');
        if (tooltipElem) {
            tooltipElem.setAttribute('class', 'show-proactive-tool-tip');
            tooltipElem.style.visibility = 'visible';
        }
    }
    function animateEMIcon(moduleConfigData, ecLauncherFloatingButton) {
        isProactiveAnimationRunning = true;
        animationTooltipClosed = false;
        var animation_type = moduleConfigData.result.proactive_animation_type;
        if (animation_type == 'bounce') {
            ecLauncherFloatingButton.setAttribute('class', 'bounce-animation');
        }
        else if (animation_type == 'ripple') {
            ecLauncherFloatingButton.setAttribute('class', 'ripple-animation');
        }
        else if (animation_type == 'slide-in') {
            ecLauncherFloatingButton.setAttribute('class', 'slide-in-animation');
        }
        if (moduleConfigData.result.show_tooltip === 'true') {
            showToolTip();
        }
        animationTimeout = setTimeout(() => {
            if(isProactiveAnimationRunning){
                stopAnimation();
                deregisterProactiveHelpEventListeners();
            }
            else{
                if(!animationTooltipClosed){
                }
            }
        }, proactiveAnimationDuration*1000);
    }
    function stopAnimation() {
        var ecLauncherFloatingButton = document.getElementById('ecLauncherFloatingBubble');
        isProactiveAnimationRunning = false;
        if (ecLauncherFloatingButton) {
            ecLauncherFloatingButton.setAttribute('class', '');
        }
        closeToolTip();
        clearTimeout(animationTimeout);
    }
    function injectAnimationAndTooltipElems(moduleConfigData) {
        var v_paddingg = parseInt(moduleConfigData.result.v_padding) + 70 + 'px';
        if(moduleConfigData.result.proactive_animation_type == 'bounce'){
            v_paddingg = parseInt(moduleConfigData.result.v_padding) + 90 + 'px';
        }
        var h_paddingg = parseInt(moduleConfigData.result.h_padding) - 40 + 'px';
        var tooltipDivElement = document.createElement('div');
        tooltipDivElement.id = 'proactive-animation-tooltip';
        var tooltipTemplate =   '<div id="proactive-animation-tooltip-close-btn" tab-index="0" aria-label="Close tooltip messsage">' + 
                                    '<svg  width="18" height="18" viewBox="0 0 16 16" fill="none" >' + 
'<path fill-rule="evenodd" clip-rule="evenodd" d="M3.35355 2.64642L2.64645 3.35353L7.26942 7.9765L2.64467 12.6482L3.35533 13.3517L7.97654 8.68362L12.6464 13.3535L13.3536 12.6464L8.68007 7.97294L13.2548 3.35174L12.5442 2.64821L7.97296 7.26583L3.35355 2.64642Z" fill="' + moduleConfigData.result.primary_text_color+ '"/>' +
'</svg>' +
'</div>' +
'<span class="proactive-animation-tooltip-text">' + moduleConfigData.result.tooltip_text + '</span>' +
                                '<style>' + 
                                    '#proactive-animation-tooltip{' + 
                                        'padding: 7px 40px 10px 16px;' + 
                                        'line-height: 19px;' + 
                                        'font-size: 16px;' + 
                                        'color: ' + moduleConfigData.result.primary_text_color + ';' + 
                                        'background: ' + moduleConfigData.result.primary_color + ';' + 
                                        'border-radius: 7px;' + 
                                        'position: fixed;' + 
                                        'bottom: ' + v_paddingg + ';';
                                        if(moduleConfigData.result.icon_position == 'right'){
                                            tooltipTemplate = tooltipTemplate + 'right: ' + h_paddingg + ';';
                                        }
                                        else{
                                            tooltipTemplate = tooltipTemplate + 'left: ' + h_paddingg + ';';
                                        }
                                        tooltipTemplate = tooltipTemplate + 'display: inline-block;' + 
                                        'border-bottom: 1px dotted black;' + 
                                        'visibility: hidden;' + 
                                        'width: 218px;' + 
                                    '}' + 
                                    '#proactive-animation-tooltip-close-btn{' + 
                                        'background: transparent;' + 
                                        'width: 18px;' + 
                                        'height: 18px;' + 
                                        'position: absolute;' + 
                                        'top: 10px;' + 
                                        'right: 13px;' + 
                                        'cursor: pointer;' + 
                                    '}' + 
                                    '.proactive-animation-tooltip-text{' + 
                                        'color:'  + moduleConfigData.result.primary_text_color + ';' +  
                                        'z-index: 1;' + 
                                        'opacity: 1;' + 
                                        'word-break: break-word;' + 
                                    '}' + 
                                    '.show-proactive-tool-tip .proactive-animation-tooltip-text::after {' + 
                                        'content: "";' + 
                                        'position: absolute;' + 
                                        'top: 100%;';
                                        if(moduleConfigData.result.icon_position == 'right'){
                                            tooltipTemplate = tooltipTemplate + 'right: 62px;';
                                        }
                                        else{
                                            tooltipTemplate = tooltipTemplate + 'left: 62px;'
                                        }
                                        tooltipTemplate = tooltipTemplate + 'border-width: 7px;' +
                                        'border-style: solid;' + 
                                        'border-color: ' + moduleConfigData.result.primary_color + ' transparent transparent transparent;' + 
                                        'visibility: visible;' + 
                                        'opacity: 1;' + 
                                    '}' + 
                                    '@keyframes bounce {' + 
                                        'from {' + 
                                            'transform: translateY(0px);' + 
                                        '}' + 
                                        'to {' + 
                                            'transform: translateY(-25px);' +
                                        '}' + 
                                    '}' + 
                                    '@-webkit-keyframes bounce {' +
                                        'from {' +
                                            ' transform: translateY(0px);' + 
                                        '}' + 
                                        'to {' + 
                                            'transform: translateY(-25px);' + 
                                        '}' + 
                                    '}' + 
                                    '.bounce-animation {' + 
                                        'animation: bounce 1s infinite alternate;' + 
                                        '-webkit-animation: bounce 1s infinite alternate;' + 
                                    '}' + 
                                    '@keyframes ripple {' + 
                                        'from {' + 
                                            'opacity: 1;' + 
                                            'transform: scale(0);' + 
                                        '}' + 
                                        'to {' + 
                                            'opacity: 0;' + 
                                            'transform: scale(2);' + 
                                        '}' + 
                                    '}' + 
                                    '.ripple-animation:before { ' + 
                                        'content: "";' + 
                                        'position: absolute;' + 
                                        'width: 100%;' + 
                                        'height: 100%;' + 
                                        'background-color: inherit;' + 
                                        'border-radius: 50%;' + 
                                        'z-index: -1;' + 
                                        'animation: ripple 1.5s ease-out 0.2s infinite;' + 
                                        'bottom: 0;' + 
                                        'right: 0;' + 
                                    '}' + 
'</style>';
        tooltipDivElement.innerHTML = tooltipTemplate;
            var ecEmbedWrapperDiv = document.getElementsByClassName('ecEmbedWrapper')[0];
            ecEmbedWrapperDiv.appendChild(tooltipDivElement);
            document.getElementById('proactive-animation-tooltip-close-btn').addEventListener("click", closeToolTipWrapperFunc);
    }
    function openWidgetProactively(paramsObj) {
        if(contextualRecommendationsShown){
            persistManualRecommendations = true;
        }
        if (proactiveHelpOpen) {
            if (POPUP_SHOW){
                hideMessengerFrame();
                widgetFrame.contentWindow.postMessage("RESET_LOCATION_AFTER_NOTIFICATION", EC_ORIGIN);
                POPUP_SHOW = false;
            }
            setTimeout(() => {
                openWidget();
            }, 1000);
        }
        else {
            proactiveHelpOpen = true;
            widgetFrame.contentWindow.postMessage(paramsObj, EC_ORIGIN);
        }
    }
   
    function deregisterProactiveHelpEventListeners() {
        window.removeEventListener('click', proactiveEventListenerFunc);
        window.removeEventListener('keyup', proactiveEventListenerFunc);
        clearTimeout(proactiveTimeout);
        proactiveEventListenersAdded = false;
    }
    function registerProactiveHelpEventListeners(){
        window.addEventListener("keyup", proactiveEventListenerFunc );
        window.addEventListener("click", proactiveEventListenerFunc);
        proactiveEventListenersAdded = true;
    }
    function showProactiveHelp(moduleConfigData) {
        if (isIntermediatePageOpen) {
            return;
        }
        if (IS_WIDGET_COLLAPSED && (!POPUP_SHOW || popupClosed)) {
            popupClosed = false;
            var proactive_help_type = moduleConfigData.result.proactive_help_type;
            if (proactive_help_type == 'animation') {
                var ecLauncherFloatingButton = document.getElementById('ecLauncherFloatingBubble');
                if (!isProactiveAnimationRunning) {
                    stopAnimation();
                    setTimeout(() => {
                        animateEMIcon(moduleConfigData, ecLauncherFloatingButton);
                    }, 1000);
                }
            }
            else {
                var featureId, featureParams, paramsObj;
                if (proactive_help_type == 'offer_chat') {
                    fetchRequest({
                        method: "GET",
url: EC_ORIGIN + "/api/sn_csm_ec/engagement_center_api/modules/" + moduleConfigData.result.portal,
                        props: {
                            "withCredentials": true
                        }
                    }).then(function (apiResponse) {
                        var apiResponse = JSON.parse(apiResponse);
                        var isChatOffline = apiResponse.result.isChatOffline;
                        if (isChatOffline) {
                        }
                        else {
                            paramsObj = {
                                type: 'OPEN_PROACTIVE_OR_RECOMMENDATIONS',
                                value: '?id=proactive_chat_page&context_load=true',
                            }
                            openWidgetProactively(paramsObj);
                        }
                    });
                }
                else if (proactive_help_type == 'offer_search') {
                    paramsObj = {
                        type: 'OPEN_PROACTIVE_OR_RECOMMENDATIONS',
                        value: '?id=proactive_search_page&context_load=true',
                    }
                    openWidgetProactively(paramsObj);
                }
                else if (proactive_help_type == 'offer_recommendations') {
                    if(contextualRecommendationsShown){
                        persistManualRecommendations = true;
                        proactiveHelpOpen = true;
                        contextualRecommendationsShown = false;
                        changeLastUrl("recommendations&called_onload=true", "called_onload", "called_proactively");
                        if (POPUP_SHOW){
                            hideMessengerFrame();
                            widgetFrame.contentWindow.postMessage("RESET_LOCATION_AFTER_NOTIFICATION", EC_ORIGIN);
                            POPUP_SHOW = false;
                        }
                        setTimeout(() => {
                            openWidget();
                            widgetFrame.contentWindow.postMessage({type: 'PROACTIVE_RECOMMENDATIONS_OPENED', openedFromAnimation: false}, EC_ORIGIN);
                        }, 1000);
                        
                        
                    }
                    else{
                        paramsObj = {
                            type: 'OPEN_PROACTIVE_OR_RECOMMENDATIONS',
                            value: '?id=recommendations&spa=1&called_proactively=true&q=' + encodeURIComponent(getProactiveRecommendationsQueryterm() || '') + '&context_load=true',
                        }
                         openWidgetProactively(paramsObj);
                    }
                }
            }
        }
    }
    function proactiveLoadCheck(moduleConfigData) {
        injectAnimationAndTooltipElems(moduleConfigData);
        if (!proactiveEventListenersAdded) {
            var proactive_inactivity_time = parseInt(moduleConfigData.result.proactive_inactivity_time);
            var proactiveHelpType = moduleConfigData.result.proactive_help_type;
           if (proactiveHelpType && proactiveHelpType != 'none') {
                if (isProactiveHelpDismissed) {
                }
                else {
                    setTimeout(function () {
                        if (!initialUserActivityDetected && !proactiveClosedAfterRefresh) {
                            showProactiveHelp(moduleConfigData);
                        }
                    }, proactive_inactivity_time * 1000);
                    proactiveEventListenerFunc = function (event) {
                        initialUserActivityDetected = true;
                        clearTimeout(proactiveTimeout);
                        proactiveTimeout = setTimeout(function () { showProactiveHelp(moduleConfigData) }, proactive_inactivity_time * 1000);
                    }
                    registerProactiveHelpEventListeners();
                }
            }
        }
    }
    function getProactiveRecommendationsQueryterm() {
        var str = window.location.href;
str = str.split('/');
        var res = str[str.length - 1];
        if(res==''){
            if(str.length>=2)
                res=str[str.length-2];
        }
        return res;
    }
    function storeProactivehelpDismissActivity() {
        widgetFrame.contentWindow.postMessage({ type: 'STORE_PROACTIVE_DISMISSED', page: window.location.href}, EC_ORIGIN);
    }
    
    function customizeMessenger(data) {
        IFRAME_HEIGHT = data.height || IFRAME_HEIGHT;
        IFRAME_DOCOUT_WIDTH = data.width || IFRAME_DOCOUT_WIDTH;
        IFRAME_LAUNCHER_ICON_SRC = data.result.icon || IFRAME_LAUNCHER_ICON_SRC;
        IFRAME_CLOSE_ICON_SRC = data.result.close_icon || IFRAME_CLOSE_ICON_SRC;
        IFRAME_V_PADDING = data.result.v_padding || IFRAME_V_PADDING;
        ICON_COLOR = data.result.primary_color || ICON_COLOR;
        FLOATING_BUBBLE_SIZE = data.result.iconSize || FLOATING_BUBBLE_SIZE;
        MESSENGER_LOCATION = data.result.icon_position || MESSENGER_LOCATION;        
        IFRAME_H_PADDING = data.result.h_padding || IFRAME_H_PADDING;
        LOGIN_MSG = data.result.login_wait_msg || LOGIN_MSG;
        NOTIFICATION_COUNT_BG_COLOR = data.result.tertiary_color || NOTIFICATION_COUNT_BG_COLOR;
        NOTIFICATION_COUNT_TEXT_COLOR = data.result.tertiary_text_color || NOTIFICATION_COUNT_TEXT_COLOR;
        LAUNCHER_ICON_TOOLTIP = data.result.launcher_icon_tooltip || LAUNCHER_ICON_TOOLTIP;
        CLOSE_ICON_TOOLTIP = data.result.close_icon_tooltip || CLOSE_ICON_TOOLTIP;
        updateImageDim();
    }
    function updateImageDim(){
        var img = new Image();
        var dim={"width":24,"height":24};
        img.onload = function(){
            dim["width"]=img.width;
            dim["height"]=img.height;
            if(dim["width"]>60)
                dim["width"]=60;
            if(dim["width"]<24)
                dim["width"]=24;
            if(dim["height"]>60)
                dim["height"]=60;
            if(dim["height"]<24)
                dim["height"]=24;
            LAUNCHER_ICON_WIDTH = dim["width"] || LAUNCHER_ICON_WIDTH;
            LAUNCHER_ICON_HEIGHT = dim["height"] || LAUNCHER_ICON_HEIGHT;
LAUNCHER_ICON_MARGIN_LEFT = -1*(LAUNCHER_ICON_WIDTH/2);
LAUNCHER_ICON_MARGIN_TOP = -1*(LAUNCHER_ICON_HEIGHT/2);
            document.getElementsByClassName("ecEmbedWidgetlauncher")[0].style.width = LAUNCHER_ICON_WIDTH+'px';
            document.getElementsByClassName("ecEmbedWidgetlauncher")[0].style.height = LAUNCHER_ICON_HEIGHT+'px';
            document.getElementsByClassName("ecEmbedWidgetlauncher")[0].style.marginLeft = LAUNCHER_ICON_MARGIN_LEFT+'px';
            document.getElementsByClassName("ecEmbedWidgetlauncher")[0].style.marginTop = LAUNCHER_ICON_MARGIN_TOP+'px';
            document.getElementsByClassName("ecEmbedWidgetlauncher")[0].src = IFRAME_LAUNCHER_ICON_SRC;
        };
        img.src = IFRAME_LAUNCHER_ICON_SRC;
    }
    function getTemplate(TEMPLATE_SRC) {
        return '<div class="ecEmbedWrapper">' +
            '<div class="loginMsg hidden">' +
'<div class="loader"></div>' +
'<div class="msgText">' + LOGIN_MSG + '</div>' +
'</div>' +
'<iframe id="em_iframe" title="Messenger" class="" tabindex="0" frameborder="0" src=' + TEMPLATE_SRC + '></iframe>' +
            '<button id="ecLauncherFloatingBubble">' +
            '<img class="ecEmbedWidgetlauncher hidden" src=' + IFRAME_LAUNCHER_ICON_SRC + ' title="' + LAUNCHER_ICON_TOOLTIP + '" alt="Messanger- launcher" decoding="async">' +
            '<img class="ecEmbedWidgetClose hidden" src=' + IFRAME_CLOSE_ICON_SRC + ' title="' + CLOSE_ICON_TOOLTIP + '" alt="Messanger- closed" decoding="async">' +
            '<div class="notificationCount hidden">' + 
'<span id="notificationCountValue">' + NOTIFICATION_COUNT + '</span>' +
'</div>' +
'</button>' +
'<style type="text/css">' +
            'img.ecEmbedWidgetlauncher{' +
            'box-shadow: none;' +            
            'position: absolute;' +
            'width: ' + LAUNCHER_ICON_WIDTH + 'px;' +
            'height: ' + LAUNCHER_ICON_HEIGHT + 'px;' +
            'padding: 0px;' +
            'border: 0px;' +
            'left: 50%;' +
            'top: 50%;' +
            'margin-left: ' + LAUNCHER_ICON_MARGIN_LEFT + 'px;'+
            'margin-top: ' + LAUNCHER_ICON_MARGIN_TOP + 'px;' +
            'z-index: 103;' +
            '}' +
            'img.ecEmbedWidgetClose{' +
            'box-shadow: none;' +
            'position: absolute;' +
            'width: 24px;' +
            'height: 24px;' +
            'padding: 0px;' +
            'border: 0px;' +
            'left: 50%;' +
            'top: 50%;' +
            'margin-left: -12px;' +
            'margin-top: -12px;' +
            'z-index: 103;' +
            '}' +
            'img.ecEmbedWidgetlauncher:active {' +
            'outline: none;' +
            '}' +
            '.ecEmbedWrapper{' +
            'position: fixed;' +
            MESSENGER_LOCATION + ':0px;' +
            'z-index: 999999;' +
            'opacity: 1;' +
            'transition: width .5s ease-out,height .5s ease-out;' +
            'background-color: white;' +
            'border-radius: 5px;' +
            'display: flex;' +
            'justify-content: center;' +
            'align-items: center;' +
            'box-shadow: 0px 2px 11px rgba(0, 0, 0, 0.5);'+
            '}' +
            '.ecEmbedWrapper .loginMsg{' +
            'display: flex;' +
            '}' +
            '.ecEmbedWrapper .loader{' +
            'border: 16px solid #f3f3f3;' +
            'border-radius: 50%;' +
            'border-top: 16px solid #3498db;' +
            'width: 30px;' +
            'height: 30px;' +
            '-webkit-animation: spin 2s linear infinite;' +
            'animation: spin 2s linear infinite;' +
            'display: inline-block;' +
            '}' +
            '.ecEmbedWrapper .msgText{' +
            'margin: auto;' +
            'padding-left: 15px;' +
            '}' +
            '@keyframes spin {' +
            '0% { transform: rotate(0deg); }' +
            '100% { transform: rotate(360deg); }' +
            '}' +
            '.ecEmbedWrapper.dockOut.mobile{' +
            'height: 100%;' +
            'width: 100%;' +
            'position: absolute;' +
            'max-height: 100%;' +
            'bottom: 0px;' +
            '}' +
            '.ecEmbedWrapper.dockOut{' +
            'height: 100%;' +
            'bottom: 0px;' +
            'max-height: 100%;' +
            'width: ' + IFRAME_DOCOUT_WIDTH + ';' +            
            '}' +
            '.ecEmbedWrapper.dockIn{' +
            'height: ' + IFRAME_HEIGHT + ';' +
            'width: ' + IFRAME_DOCIN_WIDTH + ';' +
            'bottom:' + (parseInt(IFRAME_V_PADDING) + parseInt(FLOATING_BUBBLE_SIZE) + 5) + 'px;' +
            'max-height: calc(100% - ' + (parseInt(IFRAME_V_PADDING) + parseInt(FLOATING_BUBBLE_SIZE) + 5) + 'px);' +
            MESSENGER_LOCATION + ':' + IFRAME_H_PADDING + 'px' +
            '}' +
            '.ecEmbedWrapper iframe{' +
            'border: 0;' +
            'height: 100%;' +
            'width: 100%;' +
            (isMobilePlatform() ? 'border-radius: 0px;' : 'border-radius: 5px;' ) +
            'position: absolute;' +
            'left: 0;' +
            'z-index: 102;' +
            'box-shadow: 0px 2px 11px rgba(0, 0, 0, 0.5);' +
            '}' +
            '.ecEmbedWrapper .hidden{' +
            'display: none;' +
            '}' +
            'button#ecLauncherFloatingBubble{' +
            'display:block;' +
            'height:' + FLOATING_BUBBLE_SIZE + 'px;' +
            'width:' + FLOATING_BUBBLE_SIZE + 'px;' +
            'border-radius: 50%;' +
            'background-color: ' + ICON_COLOR + ';' +
            'border: none;'+
            'cursor: pointer;' +
            'z-index: 100;' +
            'position: fixed;' +            
            'bottom:' + IFRAME_V_PADDING + 'px;' +
            MESSENGER_LOCATION + ':' + IFRAME_H_PADDING + 'px' +
            '}' +
            'button#ecLauncherFloatingBubble:focus{' +
            'outline: 5px auto ' + ICON_COLOR + ' !important;' +
            'box-shadow: none;' +
            'border: none;' +
            '}' +
            '.ecHtmlPageMobileFullScreen{' +
            'overflow: hidden !important;' +
            'width: 100%;' +
            'height: 100%;' +
            'position: fixed;' +
            '-webkit-overflow-scrolling: touch;' +
            '}' +
            '.notificationCount{' +
            'margin-top: -30px;' +
            'margin-left: 36px;' +
            'background-color:' + NOTIFICATION_COUNT_BG_COLOR + ';' +
            'color:' + NOTIFICATION_COUNT_TEXT_COLOR + ';' +
            'font-size: 16px;' +
            'font-weight: 400;' +
            'border-radius: 50%;' +
            'width: 28px;' +
            'height: 28px;' +
            'position: absolute;' +
            'z-index: 104;' +
            '}' +
            '#notificationCountValue{' +
            'vertical-align:middle;' +
            'line-height: 30px;' +
            'text-align: center;' +
            '}' +
'</style>' +
'</div>';
    }
    function fetchRequest (opts) {
        opts.headers = opts.headers || {};
        opts.props = opts.props || {};
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url);
            xhr.onload = function () {
                resolve(xhr.responseText);
            };
            xhr.onerror = function () {
                reject({ status: this.status, statusText: xhr.statusText });
            };            
            Object.keys(opts.headers).forEach(function (key) {
                xhr.setRequestHeader(key, opts.headers[key]);
            });
            Object.keys(opts.props).forEach(function (key) {
                xhr[key] = opts.props[key];
            });
            xhr.send(opts);
        });
    }
      
    function initilizeWidget() {
        if (ID_TOKEN) {
            if (IdpIframeEmbeddingEnabled) {
compileTemplate(EC_ORIGIN + '/sn_csm_ec_iframe_auth_landing_page.do');
                document.getElementById('em_iframe').addEventListener("load", function (e) {
                    getUserRolesAndInitWidget(true,null);
                });
            } else {
                !isLoggedInUser && document.body.addEventListener('click', authenticateViaSAML);
                compileTemplate(IFRAME_SRC);
                closeWidget();
            }
        } else {
            compileTemplate(IFRAME_SRC);
        }
    }
    function compileTemplate(templateSrc) {
        destroyWidget();
        if(templateSrc) {
        templateSrc = sanitizeIframeSrcForPopUps(templateSrc);   
        var wrapper = document.createElement('div');
        wrapper.innerHTML = getTemplate(templateSrc);
        document.body.appendChild(wrapper.firstChild);
        widgetWrapper = document.querySelector(".ecEmbedWrapper");
        launcher = document.querySelector(".ecEmbedWidgetlauncher");
            floatingBubble = document.getElementById("ecLauncherFloatingBubble");
            closerIcon = document.querySelector(".ecEmbedWidgetClose");
        widgetFrame = document.querySelector(".ecEmbedWrapper iframe");
            loginMsgSection = document.querySelector(".ecEmbedWrapper .loginMsg");
            htmlPage = document.querySelector("html");
            notificationBubble = document.querySelector(".notificationCount");
        isMobilePlatform() && widgetWrapper.classList.add("mobile");
            floatingBubble.addEventListener("click", toggleWidget);
        hideWidget();
        widgetFrame.addEventListener('load', showWidget);
        window.addEventListener('resize', checkMobile);
audioNotification = new Audio(EC_ORIGIN+'/sn_va_web_client_alert.mp3');
    }
    }
    function logoutWidget() {
        ID_TOKEN = "";
        localStorage.removeItem(STORAGE_LAST_NAVIGATION_DATA_KEY);
        compileTemplate(IFRAME_LOGOUT_SRC);
    }
    function isMobilePlatform() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
return new RegExp(/Android|iPhone|IEMobile|Windows Phone|BlackBerry|BB/gm).test(userAgent);
    }
    function checkMobile() {
        setTimeout(function() {
            isMobilePlatform() ? widgetWrapper.classList.add("mobile") : widgetWrapper.classList.remove("mobile");
        }, 100);
    }
    function hideFloatingBubbleIcon(){
        floatingBubble.style.visibility = "hidden";
    }
    function showFloatingBubbleIcon(){
        floatingBubble.style.visibility = "visible";
    }
    function hideLauncherIcon(){
        launcher.classList.add("hidden");
    }
    function showLauncherIcon(){
        launcher.classList.remove("hidden");
        launcher.parentElement.setAttribute('aria-label', LAUNCHER_ICON_TOOLTIP);
    }
    function hideMessengerFrame(){
        widgetFrame.classList.add("hidden");
    }
    function showMessengerFrame(){
        widgetFrame.classList.remove("hidden");
    }
    function hideCloseIcon() {
        closerIcon.classList.add("hidden");
    }
    function showCloseIcon() {
        closerIcon.classList.remove("hidden");
        launcher.parentElement.setAttribute('aria-label', CLOSE_ICON_TOOLTIP);
    }
    function hideWidgetContent(){
        widgetFrame.classList.add("hidden");
    }    
    function showLoginWaitMsg(){
        loginMsgSection.classList.remove("hidden");
    }
    function wasLauncherOpened(){
        return localStorage.getItem(STORAGE_LAUNCHER_STATUS_KEY) === "opened";
    }
    function toggleWidget() {
        if (POPUP_SHOW) {
            hideMessengerFrame();
            widgetWrapper.style.height = "";
            widgetFrame.contentWindow.postMessage("RESET_LOCATION_AFTER_NOTIFICATION", EC_ORIGIN);
            POPUP_SHOW = false;
        }
        !IS_WIDGET_COLLAPSED ? closeWidget() : openWidget();
    }
    function enableMobileFullScreenMode() {
        htmlPage.classList.add("ecHtmlPageMobileFullScreen");
    }
    function disableMobileFullScreenMode() {
        htmlPage.classList.remove("ecHtmlPageMobileFullScreen");
    }
    function openWidget() {
        if(isProactiveAnimationRunning){
            stopAnimation();
            if(contextualRecommendationsShown || recommendationsFromAnimation){
                if(contextualRecommendationsShown){
                    persistManualRecommendations = true; 
                }
                contextualRecommendationsShown = false;
                changeLastUrl("recommendations&called_onload=true", "called_onload", "called_proactively=true&recommendationsFromAnimation");
                widgetFrame.contentWindow.postMessage({type: 'PROACTIVE_RECOMMENDATIONS_OPENED', openedFromAnimation: true }, EC_ORIGIN);
            }
            else{
                widgetFrame.contentWindow.postMessage({ type: "OPEN_PROACTIVE_OR_RECOMMENDATIONS", value: '?id=recommendations&spa=1&called_proactively=true&recommendationsFromAnimation=true&q=' + encodeURIComponent(getProactiveRecommendationsQueryterm() || '') + '&context_load=true'}, EC_ORIGIN);
            }
            recommendationsFromAnimation = true;
        }
        hideLauncherIcon();
        showCloseIcon();
        isMobilePlatform() && hideFloatingBubbleIcon();
        isMobilePlatform() && enableMobileFullScreenMode();
        (isMobilePlatform() || isLastDockStateOUT) ? dockOutMessenger() : dockInMessenger();
        showMessengerFrame();
        localStorage.setItem(STORAGE_LAUNCHER_STATUS_KEY, "opened");
        IS_WIDGET_COLLAPSED = false;
        widgetFrame.contentWindow.postMessage({type:"EC_STATUS",status:"opened"}, EC_ORIGIN);
        widgetFrame.focus();
        notificationBubble.classList.add("hidden");
        if(!POPUP_SHOW) widgetFrame.contentWindow.postMessage("EC_OPENED!", EC_ORIGIN);
        else {
            POPUP_SHOW = false;
        }
        if(baseUrl) widgetFrame.contentWindow.postMessage({type:"baseUrl", value:baseUrl }, EC_ORIGIN);
    }
    function closeWidget() {
        hideMessengerFrame();
        hideCloseIcon();
        showLauncherIcon();
        resetHeight();
        showFloatingBubbleIcon();
        if(NOTIFICATION_COUNT != '' && NOTIFICATION_COUNT != '0') notificationBubble.classList.remove("hidden");
        isMobilePlatform() && disableMobileFullScreenMode();
        localStorage.setItem(STORAGE_LAUNCHER_STATUS_KEY, "closed");
        IS_WIDGET_COLLAPSED = true;
         widgetFrame.contentWindow.postMessage({type:"EC_STATUS",status:"closed"}, EC_ORIGIN);
    }
    function hideWidget() {
        hideMessengerFrame();
        hideFloatingBubbleIcon();
    }
    function showWidget() {
        showFloatingBubbleIcon();
        wasLauncherOpened() ? openWidget() : closeWidget();
    }
    function destroyWidget() {
        widgetWrapper && widgetWrapper.parentNode.removeChild(widgetWrapper);
    }
    function onExternalUserLogin() {
        onLoadConfig.then(function(SSOType) {
            localStorage.removeItem(STORAGE_LAST_NAVIGATION_DATA_KEY);
            var lastVisitedUrl = getLastVisitedUrl();
            if(!!lastVisitedUrl && loadLastURL){
                IFRAME_SRC = lastVisitedUrl;
                isLastUrlIntermediate();
                setLangParamOnLastVisitedUrl();
            }
            else{
                setIframeSrcOnLang();
            }      
            proactiveHelpOpen = false;
            manualRecommendationsCheck();    
            if (SSOType === "OIDC") {
                authenticateViaOIDC();
            } else if (SSOType === "SAML") {
                !isLoggedInUser && document.body.addEventListener('click', authenticateViaSAML);
                initilizeWidget();
                closeWidget();
            }
        });
    }
    function setIframeSrcOnLang() {
IFRAME_SRC = EC_ORIGIN + "/" + PORTAL_ID;
        sanitizeIframeSrcForLang();
        var CONTEXTNew = '';
        if (IFRAME_LANG != '') {
            IFRAME_SRC = IFRAME_SRC + '?lang=' + IFRAME_LANG;
            CONTEXTNew = CONTEXT.substring(0, 0) + '&' + CONTEXT.substring(1);
            IFRAME_SRC += CONTEXTNew;
        } else {
            IFRAME_SRC += CONTEXT;
        }
    }
    function sanitizeIframeSrcForLang() {
        var langIndex = -1;
        if(IFRAME_SRC.indexOf('?lang=') > -1){
            langIndex = IFRAME_SRC.indexOf('?lang=') + 1;
        } else if(IFRAME_SRC.indexOf('&lang=') > -1){
            langIndex = IFRAME_SRC.indexOf('&lang=');
        }
        if(langIndex != -1){
            IFRAME_SRC = IFRAME_SRC.substring(0,langIndex) + IFRAME_SRC.substring(langIndex+8, IFRAME_SRC.length);
        }
    }
    function setLangParamOnLastVisitedUrl() {
        sanitizeIframeSrcForLang();
        if(IFRAME_LANG != ''){
            IFRAME_SRC = IFRAME_SRC + (IFRAME_SRC.includes('?') ? '&' : '?')  + 'lang=' + IFRAME_LANG;
        }
    }
    function sanitizeIframeSrcForPopUps(iframe_src) {
        iframe_src = iframe_src.replaceAll("?se_modal=false", "").replaceAll("&se_modal=false", "");
        if(iframe_src.includes('?')){
            iframe_src += "&se_modal=false";
        }else{
            iframe_src += '?se_modal=false';
        }
        return iframe_src;
      }
      
    
    function authenticateViaOIDC() {
        try {
            fetchTokenCallback().then(function(token) {
                if (token) {
                    ID_TOKEN = token;
                    initilizeWidget();
                }
            });
        } catch (err) {
            ID_TOKEN = "";
            throw new Error("Token fetch failed");
        }
    }
    function authenticateViaSAML() {
        if(!isLoggedInUser){
            var popupFeature = "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=100, height=100";
popupObjectReference = !isLoggedInUser ? window.open(EC_ORIGIN + '/sn_csm_ec_saml_auth_landing_page.do', "login", popupFeature) : null;
            showLoginWaitMsg();
            hideWidgetContent();
        }
        document.body.removeEventListener('click', authenticateViaSAML);
    }
    function reAuthenticate() {
        onLoadConfig.then(function(SSOType) {
            if (SSOType === "OIDC") {
                authenticateViaOIDC();
            } else if (SSOType === "SAML") {
                authenticateViaSAML();
            }
        });
    }
    function dockOutMessenger() {
        widgetWrapper.classList.remove("dockIn");
        widgetWrapper.classList.add("dockOut");
    }
    function dockInMessenger(){
        widgetWrapper.classList.remove("dockOut");
        widgetWrapper.classList.add("dockIn");
    }
    function resetHeight() {
        widgetWrapper.classList.remove("dockOut");
        widgetWrapper.classList.remove("dockIn");
    }
    function getLastVisitedUrl(){
        var lastUrl = "";
        var lastVisitedUrlInfo = localStorage.getItem(STORAGE_LAST_NAVIGATION_DATA_KEY);
        var urlObj = lastVisitedUrlInfo && JSON.parse(lastVisitedUrlInfo);
        lastUrl = (urlObj && PORTAL_ID === urlObj.portal) ? urlObj.path : "";
        return lastUrl;
    }
    function updateLastUrl(url){
        var lastNavigationData = {};
        lastNavigationData.portal = PORTAL_ID;
        lastNavigationData.path = url;
        localStorage.setItem(STORAGE_LAST_NAVIGATION_DATA_KEY, JSON.stringify(lastNavigationData));
    }
    function changeLastUrl(url1, url2, url3) {
        var lastNavigationData = localStorage.getItem(STORAGE_LAST_NAVIGATION_DATA_KEY) ? JSON.parse(localStorage.getItem(STORAGE_LAST_NAVIGATION_DATA_KEY)) : {};
        if(lastNavigationData.path && lastNavigationData.path.includes(url1)){
            lastNavigationData.portal = PORTAL_ID;
            lastNavigationData.path = lastNavigationData.path.replace(url2, url3);
            localStorage.setItem(STORAGE_LAST_NAVIGATION_DATA_KEY, JSON.stringify(lastNavigationData));
        }
    }
    function isLastUrlIntermediate() {
        if(IFRAME_SRC.includes('id=recommendations') || IFRAME_SRC.includes('id=proactive_search_page') || IFRAME_SRC.includes('id=proactive_chat_page')){
            isIntermediatePageOpen = false;
            blockManualRecommendations = true;
            if(IFRAME_SRC.includes('id=recommendations')){
                var searchTerm = IFRAME_SRC.substring(IFRAME_SRC.indexOf('q=')+2);
                searchTerm = searchTerm.substring(0,searchTerm.indexOf('&')!=-1 ? searchTerm.indexOf('&')  : searchTerm.length); 
                IFRAME_SRC = IFRAME_SRC.replace(searchTerm , encodeURIComponent(getProactiveRecommendationsQueryterm() || ''));
            }
        }
        else{
            isIntermediatePageOpen = true;
        }
    }
    function manualRecommendationsCheck(){
        if (moduleRespData.result.enable_recommendations == 'true' && !proactiveHelpOpen && !isCalledFromDeepLinking && enableRecommendations && !isIntermediatePageOpen && !blockManualRecommendations) {
            if (IFRAME_LANG == '') {
IFRAME_SRC = EC_ORIGIN + "/" + PORTAL_ID + '?id=recommendations&called_onload=true&spa=1&q=' + encodeURIComponent(getProactiveRecommendationsQueryterm() || '');
            }
            else {
IFRAME_SRC = EC_ORIGIN + "/" + PORTAL_ID + '?lang=' + IFRAME_LANG + '&id=recommendations&called_onload=true&spa=1&q=' + encodeURIComponent(getProactiveRecommendationsQueryterm() || '');
            }
        }
    }
    window.addEventListener("message", function(e) {
        if (e.origin !== EC_ORIGIN)
            return;
        switch(e.data.type){
            case "SYC": {
                isLoggedInUser = e.data.status;
                if(e.data.proactiveHelpDismissedPages){
                    isProactiveHelpDismissed = !!e.data.proactiveHelpDismissedPages[window.location.href];
                    if (Object.keys(e.data.proactiveHelpDismissedPages).length >= proactiveHelpDismissThreshold){
                        isProactiveHelpDismissed = true;
                    }
                }
                else{
                    isProactiveHelpDismissed = false;
                }
                var emStatus = wasLauncherOpened() ? "opened" : "closed";
                widgetFrame.contentWindow.postMessage({type:"SYC_ACK!",status: emStatus, dockedOut: !isLastDockStateOUT}, EC_ORIGIN);
                proactiveLoadCheck(moduleRespData);
                widgetFrame.contentWindow.postMessage({type:"NAV_CHECK", currURL: e.data.currUrl}, EC_ORIGIN);
                break;
            }
            case "UPDATE_LAST_NAV": {
                if (e.data.url === '') {
updateLastUrl(EC_ORIGIN + '/' + PORTAL_ID);
                } else {
updateLastUrl(EC_ORIGIN + '/' + e.data.url);
                }
                break;
            }
            case "IFRAME_DOC_OUT": {
                isLastDockStateOUT = true;
                dockOutMessenger();
                break;
            }
            case "IFRAME_DOC_IN": {
                isLastDockStateOUT = false;
                dockInMessenger();
                break;
            }
            case "CLOSE_MESSENGER": {
                if (!POPUP_SHOW && !proactiveHelpOpen) isLastDockStateOUT = true;
                closeWidget();
                popupClosed = true;
                if(prevPageBeforePopup == '' || prevPageBeforePopup == CONFIG_ID || prevPageBeforePopup.includes('id=recommendations') || prevPageBeforePopup.includes('id=proactive_search_page') || prevPageBeforePopup.includes('id=proactive_chat_page')){
                    isIntermediatePageOpen = false;
                }
                else{
                    isIntermediatePageOpen = true;
                }
                if(proactiveEventListenersAdded){
                    proactiveEventListenerFunc();
                }
                break;
            }
            case "OPEN_MESSENGER": {
                if(POPUP_SHOW) widgetWrapper.style.height = "";
                openWidget();
                break;
            }
            case "LOGIN_EVENT": {
            popupObjectReference && popupObjectReference.close();
            getUserRolesAndInitWidget(true,null);
                break;
            }
            case "USER_STATE_CHANGE": {
            isLoggedInUser = e.data.status;
                break;
            }
            case "GLIDE_REFRESH": {
            isLoggedInUser = false;
                reAuthenticate();
            }
            case "LOCATION_CHANGED": {
                updateLastUrl(e.data.url);
                break;
            }
            case "SET_INTERMEDIATE_PAGE_OPEN": 
            {
                isIntermediatePageOpen = e.data.isIntermediatePageOpen;
                prevPageBeforePopup = e.data.prevPageBeforePopup;
                break;
            }
            case "SHOW_NOTIFICATION": {
                if (IS_WIDGET_COLLAPSED) {
                    POPUP_SHOW = true;
                    stopAnimation();
                    popupClosed = false;
                    widgetWrapper.style.height = e.data.height || "207px";
                    (isMobilePlatform() || isLastDockStateOUT) ? dockOutMessenger() : dockInMessenger();
                    showMessengerFrame();
                }
                break;
            }
            case "UPDATE_NOTIFICATION_COUNT": {
                NOTIFICATION_COUNT = e.data.notificationCountData;
                if(NOTIFICATION_COUNT === '0') notificationBubble.classList.add("hidden");
                else document.getElementById("notificationCountValue").textContent = NOTIFICATION_COUNT;
                if(IS_WIDGET_COLLAPSED && NOTIFICATION_COUNT != '' && NOTIFICATION_COUNT != '0') {
                    notificationBubble.classList.remove("hidden");
        }
                break;
            }
            case "SEND_PARENT_TITLE": {
                var titleData = {
                    type:"PARENT_TITLE",
                    title: document.title
                }
                widgetFrame.contentWindow.postMessage(titleData, EC_ORIGIN);
                break;
            } 
            case "SET_PARENT_TITLE": {
                if(e.data.title) document.title = e.data.title;
                break;
            }
            case "OPEN_PROACTIVE_WIDGET": {
                if (e.data.height && !POPUP_SHOW) {
                    proactiveHelpOpen = true;
                    widgetWrapper.style.height = e.data.height;
                    isLastDockStateOUT = false;
                    dockInMessenger();
                    if(!wasLauncherOpened())
                    openWidget();
                }
                if(e.data.setRecommendationsFromAnimation){
                    recommendationsFromAnimation = true;
                }
                break;
            }
            case "CLOSE_PROACTIVE_HELP": {
                if (recommendationsFromAnimation) {
                    if (persistManualRecommendations) {
                        changeLastUrl('recommendations&called_proactively=true', 'recommendationsFromAnimation=true&', '');
                        changeLastUrl('recommendations&called_proactively=true', "called_proactively", "called_onload");
                        widgetFrame.contentWindow.postMessage({ type: 'MANUAL_RECOMMENDATIONS_OPENED' }, EC_ORIGIN);
                        contextualRecommendationsShown = true;
                        persistManualRecommendations = false;
                        recommendationsFromAnimation = false;
                    }
                    else {
                        widgetFrame.contentWindow.postMessage({ type: "REMOVE_PROACTIVE_RECOMMENDATIONS_HISTORY" }, EC_ORIGIN);
                    }
                }
                else if (proactiveHelpOpen) {
                    proactiveClosedAfterRefresh = true;
                    deregisterProactiveHelpEventListeners();
                    storeProactivehelpDismissActivity();
                    if (persistManualRecommendations && moduleRespData.result.proactive_help_type == 'offer_recommendations') {
                        changeLastUrl('recommendations&called_proactively=true', 'recommendationsFromAnimation=true&', '');
                        changeLastUrl('recommendations&called_proactively=true', "called_proactively", "called_onload");
                        widgetFrame.contentWindow.postMessage({ type: 'MANUAL_RECOMMENDATIONS_OPENED' }, EC_ORIGIN);
                        contextualRecommendationsShown = true;
                        persistManualRecommendations = false;
                        proactiveHelpOpen = false;
                        recommendationsFromAnimation = false;
                    }
                    else if(persistManualRecommendations && (moduleRespData.result.proactive_help_type == 'offer_chat' || moduleRespData.result.proactive_help_type == 'offer_search')){
                        widgetFrame.contentWindow.postMessage({ type: "OPEN_PROACTIVE_OR_RECOMMENDATIONS", value: '?id=recommendations&spa=1&called_onload=true&q=' + encodeURIComponent(getProactiveRecommendationsQueryterm() || '') + '&context_load=true' }, EC_ORIGIN);
                    }
                    else {
                        widgetFrame.contentWindow.postMessage({ type: "REMOVE_PROACTIVE_RECOMMENDATIONS_HISTORY" }, EC_ORIGIN);
                    }
                }
                if (proactiveEventListenersAdded) {
                    proactiveEventListenerFunc();
                }
                proactiveHelpOpen = false;
                recommendationsFromAnimation = false;
                closeWidget();
                break;
            }
            case "OPEN_CONTEXTUAL_RECOMMENDATIONS": {
                if( e.data.redirectedToHome){
                    contextualRecommendationsShown = false;
                }
                else{
                    contextualRecommendationsShown = true;
                    widgetWrapper.style.height = e.data.height;
                }
                break;
            }
            case "CLOSE_CONTEXTUAL_RECOMMENDATIONS": {
                recommendationsFromAnimation = false;
                closeWidget();
                if(proactiveEventListenersAdded){
                    proactiveEventListenerFunc();
                }
                break;
            }
            case "LEAVE_RECOMMENDATIONS_OPEN_HOME": {
                contextualRecommendationsShown = false;
                proactiveHelpOpen = false;
                if (e.data.resize){
                    widgetWrapper.style.height = "";
                }
                recommendationsFromAnimation = false;
                break;
            }
            case "SHOW_MORE": {
                if(!isLastDockStateOUT) {
                    widgetWrapper.style.height = e.data.height || "500px";
                }
                break;
            }
            case "RESET_EM_HEIGHT": {
                if(!isLastDockStateOUT) {
                    widgetWrapper.style.height = e.data.height || "";
                }
                proactiveHelpOpen = false;
                contextualRecommendationsShown = false;
                recommendationsFromAnimation = false;
                break;
            }
          
            case "PLAY_AUDIO": {
                audioNotification.play();
                break;
            }
        }
    }, false);
    function setRoleConfigAndInitModule(config){
        if(!EC_ORIGIN){
            var ecOrigin = config.moduleID.split("#")[0];
EC_ORIGIN = ecOrigin[ecOrigin.length - 1] == "/" ? ecOrigin.slice(0, ecOrigin.length - 1) : ecOrigin;
        }
        getUserRolesAndInitWidget(false,config);     
    }
    function getUserRolesAndInitWidget(isLogin,config){
        fetchRequest({
            method: "GET",
url: EC_ORIGIN + "/api/sn_csm_ec/engagement_center_api/checkUserRoles",
            props:{
                "withCredentials": true
            }            
        }).then(function(response){
            if (response){
                var userType = JSON.parse(response);
                if(userType.result){
                    USER_TYPE = userType.result.user;
                    if(userType.result.user=="customer"){
                        NEW_CASE_CAT_ITEM_SYS_ID = "5fc3f6141d756410f877631e17be4ece";
                    } else {
                        NEW_CASE_CAT_ITEM_SYS_ID = "097aa7701d7da410f877631e17be4ede";
                    }
                }
                CONTEXT_FEATURE_MAP["NEW_CASE"].static["sys_id"] = NEW_CASE_CAT_ITEM_SYS_ID;
            }
            if(isLogin){
                prepareContext();
                var lastVisitedUrl = getLastVisitedUrl();
                if(isHomeFeature){
IFRAME_SRC = EC_ORIGIN + "/" +PORTAL_ID;
                    if(IFRAME_LANG != ''){
                        IFRAME_SRC = IFRAME_SRC + '?lang=' + IFRAME_LANG;
                        IFRAME_SRC = IFRAME_SRC + '&context_load=true';
                    } else {
                        IFRAME_SRC = IFRAME_SRC + CONTEXT;
                    }
                }
                else if(!!lastVisitedUrl && loadLastURL && !(lastVisitedUrl.includes('recommendations') || lastVisitedUrl.includes('proactive') )){
                    IFRAME_SRC = lastVisitedUrl;
                    isLastUrlIntermediate();
                    setLangParamOnLastVisitedUrl();
                }
                else{
                    setIframeSrcOnLang();
                }
                proactiveHelpOpen = false;
                manualRecommendationsCheck();
                compileTemplate(IFRAME_SRC);
            }else{
                initialiseModule(config);
            }
        });
    }
    function initialiseModule(config){
        setConfig(config).then(function() {
            initilizeWidget();
            if(contextFunction && contextFunction.feature && contextFunction.openOnLoad)
                openWidget();
            resetHomeFeatureFlag();
        });
    }
    return {
        init: function(e) {
            if(isRolesNeededBeforeInit(e)){
                setRoleConfigAndInitModule(e);
            } else{
                initialiseModule(e);
            }
        },
        destroy: function() {
            destroyWidget();
        },
        hide: function() {
            hideWidget();
        },
        show: function() {
            showWidget();
        },
        open: function() {
            openWidget();
        },
        close: function() {
            closeWidget();
        },
        dockOut: function() {
            dockOutMessenger();
        },
        dockIn: function() {
            dockInMessenger();
        },
        onLogin: function() {
            onExternalUserLogin();
        },
        onLogout: function() {
            logoutWidget();
        },
        loadEMFeature: function(){
            isCalledFromDeepLinking = false;
            isIntermediatePageOpen = false;
            return loadFeature();
        },
        addNewFeatureContext: function(e){
            addFeatureContext(e)
        }
    };
})();
;
