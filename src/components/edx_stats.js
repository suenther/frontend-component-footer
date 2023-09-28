
          function readCookie(name) {
              var nameEQ = name + "=";
              var ca = document.cookie.split(';');
              for(var i=0;i < ca.length;i++) {
                  var c = ca[i];
                  while (c.charAt(0)==' ') c = c.substring(1,c.length);
                  if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
              }
              return null;
          }

          function URL_add_parameter(url, param, value){
            var hash       = {};
            var parser     = document.createElement('a');
        
            parser.href    = url;
        
            var parameters = parser.search.split(/\?|&/);
        
            for(var i=0; i < parameters.length; i++) {
                if(!parameters[i])
                    continue;
        
                var ary      = parameters[i].split('=');
                hash[ary[0]] = ary[1];
            }
        
            hash[param] = value;
        
            var list = [];  
            Object.keys(hash).forEach(function (key) {
                list.push(key + '=' + hash[key]);
            });
        
            parser.search = '?' + list.join('&');
            return parser.href;
        }

        var getUrlParameter = function getUrlParameter(sParam) {
          var sPageURL = window.location.search.substring(1),
              sURLVariables = sPageURL.split('&'),
              sParameterName,
              i;
      
          for (i = 0; i < sURLVariables.length; i++) {
              sParameterName = sURLVariables[i].split('=');
      
              if (sParameterName[0] === sParam) {
                  return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
              }
          }
         };

          function checkEdxIfHidden(){
            var edx_hiddenPropName;
            
            if (typeof document.hidden !== "undefined") {
              edx_hiddenPropName = "hidden";
            } else if (typeof document.mozHidden !== "undefined") {
              edx_hiddenPropName = "mozHidden";
            } else if (typeof document.msHidden !== "undefined") {
              edx_hiddenPropName = "msHidden";
            } else if (typeof document.webkitHidden !== "undefined") {
              edx_hiddenPropName = "webkitHidden";
            }

            return document[edx_hiddenPropName];
          }

          var hash_state = new Object();

          function onPlayerReady(event) {
          }
          function change_yt_state(playerStatus, id) {
            if (playerStatus == -1) {
              hash_state[id] = "off";
            } else if (playerStatus == 0) {
              hash_state[id] = "off";
            } else if (playerStatus == 1) {
              hash_state[id] = "playing";
            } else if (playerStatus == 2) {
              hash_state[id] = "off";
            } else if (playerStatus == 3) {
              // buffering = purple
            } else if (playerStatus == 5) {
              // video cued = orange
            }
          }
          function ed_onPlayerStateChange(event) {
            change_yt_state(event.data, event.target.getIframe().id);
          }

          function initialize_my_videos(){
           
            if((typeof YT !== "undefined") && YT && YT.Player){
            $("iframe").each(function(){
                ytplayer = new YT.get(this.id);
                ytplayer.addEventListener("onStateChange", ed_onPlayerStateChange);
                hash_state[this.id] = "off";
            });
            }else{
              setTimeout(initialize_my_videos, 100);
            }

          }
          setTimeout(initialize_my_videos, 100);


        var was_active = 0; 
        function start_my_trigger() { 
          if(was_active == 0){
            was_active = 1;
            TimeMe.initialize({
              currentPageName: window.location.pathname,
              idleTimeoutInSeconds: 30
            });
            TimeMe.setCurrentPageName(window.location.pathname);
          }
        }

        var my_gup = getUrlParameter("tredx");
        if(my_gup != null && my_gup == "1"){
            $('body').on('keydown mousemove wheel click', start_my_trigger);
        }else{
          TimeMe.initialize({
            currentPageName: window.location.pathname,
            idleTimeoutInSeconds: 30
          });
          TimeMe.setCurrentPageName(window.location.pathname);
        }

        TimeMe.startTimer();
        function initialize_eesys(){
          log = readCookie('edxloggedin');
          if(typeof(log) != "undefined" && log != null && String(log) == "true"){
  
            user_info = readCookie('edx-user-info');
            obj = user_info.replace(/\\054/g, ',');
            while(typeof obj == 'string'){
             obj = JSON.parse(obj);
            }
            if(obj != null){
  
                $.ajax({
                    url:"/app/",
                    type:"GET",
                    timeout: 7500,
                    datatype: "text",
                    processData : true,
                    data: { 
                     "u" : obj["username"]
                    },
                    contentType: false,
                    cache: false,
                    success: function(data, status){
                        if ("id" in data) {
                          $('#req_id').val(data["id"]);
                          setTimeout(send_data, 0);
                        }else{
                          setTimeout(initialize_eesys, 5000);
                        }
                    },
                    error : function(xhr, textStatus, errorThrown ) {
                        setTimeout(initialize_eesys, 5000);
                    }
                  });
  
            }
  
          }
        }

        setTimeout(initialize_eesys, 0);
        
        function update_tracking_state(){
            var edx_currently_hidden = checkEdxIfHidden();
            var still_running = false;

            var elem = document.activeElement;
            if(elem && elem.tagName == 'IFRAME' && elem.hasAttribute('id') && hash_state[elem.id]=="playing" && !edx_currently_hidden){
                TimeMe.startTimer();
                TimeMe.currentIdleTimeMs = 0;
            }
            
            for(var key in hash_state){
                  if(hash_state[key] == "playing" && !edx_currently_hidden){
                      still_running = true;
                      TimeMe.currentIdleTimeMs = 0;
                  }
              }

            $("video").each(function(){
              if(!this.paused && !this.ended && !edx_currently_hidden){
                still_running = true;
                TimeMe.currentIdleTimeMs = 0;
              }
            });

              if(still_running){
                  TimeMe.startTimer();
              }

        }

        function send_data(){
          if(TimeMe.startStopTimes[window.location.pathname] != undefined && TimeMe.currentIdleTimeMs/1000 <= 31.0){
            log = readCookie('edxloggedin');
            if(typeof(log) != "undefined" && log != null && String(log) == "true"){
  
              user_info = readCookie('edx-user-info');
              obj = user_info.replace(/\\054/g, ',');
              while(typeof obj == 'string'){
               obj = JSON.parse(obj);
              }
              if(obj != null & $('#req_id').val() != ""){
              
              $.ajax({
                  url:"/app/",
                  type:"POST",
                  contentType: false,
                  processData: false,  
                  cache: false,
                  data: JSON.stringify({
                        name: obj["username"],
                        url: window.location.href,
                        req_id: $('#req_id').val(),
                        time_active_seconds: TimeMe.getTimeOnCurrentPageInSeconds(),
                        time_idle_seconds: TimeMe.currentIdleTimeMs / 1000
                      }),
                  success: function(data, status){
                        setTimeout(send_data, 1000);
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                        setTimeout(send_data, 1000);
                  }
                });

              }
            }
          }else{
              setTimeout(send_data, 1000);
              if((TimeMe.currentIdleTimeMs/1000) > 3600){
                location.href = URL_add_parameter(location.href, 'tredx', '1');
              }
          }
      }



      var track_page_state = setInterval(update_tracking_state, 250);
