(function($){  // 매개변수(파라미터 Parameter)
    // 즉시표현함수는 제이쿼리 달러 사인기호의 
    // 외부 플러그인(라이브러리)와 충돌을 피하기 위해 사용하는 함수식

    // 객체(Object 오브젝트) 선언 {} : 섹션별 변수 중복을 피할 수 있다.
    // const obj = new Object(); // 객체 생성자 방식
    //       obj = {}  

    const obj = {  // 객체 리터럴 방식 권장
        init(){  // 대표 메서드
            this.header();
            this.section1();
            this.section2();
            this.section3();
        },
        header(){},
        section1(){
            let cnt=0;
            let setId=0;
            let winW = $(window).innerWidth();
            const slideContainer = $('#section1 .slide-container');
            const slideWrap = $('#section1 .slide-wrap');
            const slideView = $('#section1 .slide-view');
            const slide = $('#section1 .slide-view .slide');
            const slideImg = $('#section1 .slide-view .slide img');
            const pageBtn = $('#section1 .page-btn');
            const stopBtn = $('#section1 .stop-btn');
            const playBtn = $('#section1 .play-btn');
            const n = $('#section1 .slide').length-1;


            //이미지 반응형 => 비율계산
            //이미지 비율 = 이미지너비(2500)
            // 1.313715187% = 2500 / 1903
            //윈도우너비 =$(window).innerWidth();
            //이미지크기 = 창너비 * 비율

            //1.슬라이드 창 크기에 반응하는 이미지 크기 반응형 만들기
            // ? = 2560(이미지 크기) / 1903(창크기) 최초의 기준 비율 고정값 구하기
            const imgRate =1.345244351;

            //2. 이미지 translateX(-324px) 반응형 적용하기
            //  ? = 324 / 2560(이미지 크기) 최초의 기준 비율 고정값 구하기
            const transRate = 0.1265625;

            // 이미지크기 width = 이미지 비율 * 창너비
            //translateX
            slideImg.css({width:imgRate*winW, transform:`translateX(${-(imgRate*winW)*transRate}px)` });

            $(window).resize(function(){
                winW = $(window).innerWidth();
                slideImg.css({width:imgRate*winW, transform:`translateX(${-(imgRate*winW)*transRate}px)` });
            });


            //0. 메인 슬라이드 터치스와이프 touchSwap
            //데스크탑 : 마우스 터치 스와이프 이벤트
            //데스크탑 : 드래그 앤 드롭 이벤트
            
            // mouse down => 터치 시작
            // mouse up => 터치 끝
            //화면의 왼쪽 끝이 0 ~ 오른쪽 끝이 1920
            let mouseDown = null; // 터치스와이프 변수
            let mouseUp = null;
            let dragStart = null; // 드래그 변수
            let dragEnd = null;
            let mDown = false; // 마우스 다운(드래그 시작 알림)
            let sizeX = 10; //드래그 길이

            //슬라이드박스 좌측 끝 좌표값
            //console.log(slideWrap.offset().left);

            slideContainer.on({
                mousedown(e){
                    winW = $(window).innerWidth(); //마우스 다운 하면 창너비 다시 가져옴
                    mouseDown = e.clientX;
                    //슬라이드랩퍼박스 좌측 좌표값
                    //계속 드래그 시 슬라이드 박스 좌측값 설정한다.
                    dragStart = e.clientX - (slideWrap.offset().left+winW);
                    mDown = true; //드래그 시작
                    slideView.css({cursor:'grabbing'}); // 주먹모양 커서
                },
                mouseup(e){
                    mouseUp = e.clientX;
                    if(mouseDown-mouseUp > sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }
                    }
                    if(mouseDown-mouseUp < -sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }
                    }
                    //-900>= 이상이고 <= 900 이하
                    if( mouseDown-mouseUp>=-sizeX && mouseDown-mouseUp<=sizeX){
                        mainSlide();
                    }
                    mDown=false; // 드래그 끝
                    slideView.css({cursor:'grab'}) // 손바닥 모양 커서
                },
            });

            //slideContainer 영역을 벗어나면 mouseup의 예외처리 (디버깅)
            //데스크 탑에서만 사용 document 예외처리
            $(document).on({
                mouseup(e){
                    if(!mDown) {return;}   
                    mouseUp = e.clientX;
                    if(mouseDown-mouseUp > sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }
                    }
                    if(mouseDown-mouseUp < -sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }
                    }
                    mDown=false; // 드래그 끝
                    slideView.css({cursor:'grab'});
                }
            });

            //8/10
            //태블릿 & 모바일 : 손가락(fingering) 터치 스와이프 이벤트 
            //태블릿 & 모바일 : 손가락(fingering) 드래그 앤 드롭 이벤트
            // 태블릿과 모바일에서만 이벤트 동작 => 반응형으로 바꿔주기(개발자모드)
            //originalEvent: TouchEvent, type: 'touchstart'
            
            slideContainer.on({
                touchstart(e){
                    winW = $(window).innerWidth(); //마우스 다운 하면 창너비 다시 가져옴
                    mouseDown = e.originalEvent.changedTouches[0].clientX;
                    //슬라이드랩퍼박스 좌측 좌표값
                    //계속 드래그 시 슬라이드 박스 좌측값 설정한다.
                    dragStart = e.originalEvent.changedTouches[0].clientX - (slideWrap.offset().left+winW);
                    mDown = true; //드래그 시작
                    slideView.css({cursor:'grabbing'}); // 주먹모양 커서
                },
                touchend(e){
                    mouseUp = e.originalEvent.changedTouches[0].clientX;
                    if(mouseDown-mouseUp > sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            nextCount();
                        }
                    }
                    if(mouseDown-mouseUp < -sizeX){
                        clearInterval(setId);
                        if(!slideWrap.is(':animated')){
                            prevCount();
                        }
                    }
                    //-10>= 이상이고 <= 10 이하
                    if( mouseDown-mouseUp>=-sizeX && mouseDown-mouseUp<=sizeX){
                        mainSlide();
                    }
                    mDown=false; // 드래그 끝
                    slideView.css({cursor:'grab'}) // 손바닥 모양 커서
                },
            });

            // 손가락 이벤트 확인하기 테스트하기.
            // slideContainer.on({
            //     touchstart(event){ // event 라고 쓰면 중괄호 안에도 event/ e만 쓰면 중괄호 안에도 e
            //         console.log(event); // 손가락 터치 이벤트 확인하기
            //         console.log(event.originalEvent.changedTouches[0].clientX);
            //     },
            //     touchend(e){
            //         console.log(e);
            //         console.log(e.originalEvent.changedTouches[0].clientX);
            //     },
            //     touchmove(e){
            //         //console.log(e);
            //         console.log(e.originalEvent.changedTouches[0].clientX);
            //     }
            // });

            // 1. 메인슬라이드함수 (페이드 인 아웃 수정) 8월 10일
            // Fade in / out 효과 애니메이션 슬라이드 구현
            // - 모든 슬라이드를 position: absolute; 로 해준다.
            // - 맨 위 그리고 아래 포개진 슬라이드 앞 뒤 순서를 정한다. z-index : 3, 2, 1 
            //  Fade out 효과는 opacity:0 를 사용한다. 시간은 0.6s 또는 1s
            // 계속 10개의 슬라이드 반복적으로 회전하여 순서대로 보여준다.
            
            mainNextSlide(); //로딩시에 실행
            // 다음 메인 슬라이드
            function mainNextSlide(){
                slide.css({zIndex:1, opacity:1});
                slide.eq(cnt).css({zIndex:2}); //순서번호 정하기 위해 eq쓴다. 다음슬라이드 번호
                //cnt가 0이면 마지막 슬라이드 번호를 출력하라 9.
                //그렇지 않으면 cnt-1을 빼라.
                slide.eq(cnt===0 ? n : cnt-1).css({zIndex:3}).stop().animate({opacity:0}, 1000); //순서번호 정하기 위해 eq쓴다. 현재슬라이드 번호, 부드럽게 사라진다, 1초동안 1000
                pageEvent();
            }
            // 이전 메인 슬라이드
            function mainPrevSlide(){
                slide.css({zIndex:1, opacity:1});
                slide.eq(cnt===n ? 0 : cnt+1).css({zIndex:2}); //순서번호 정하기 위해 eq쓴다.
                slide.eq(cnt).css({zIndex:3}).stop().animate({opacity:0},0).animate({opacity:1}, 1000); //순서번호 정하기 위해 eq쓴다. 현재슬라이드 번호
                //사라졌다가 부드럽게 나타난다. 1초동안 1000
                pageEvent();
            }

            // 2-1. 다음카운트함수
                function nextCount(){
                    cnt++;
                    if(cnt>n)cnt=0;
                    mainNextSlide();
                }

            // 2-2. 이전카운트함수
                function prevCount(){
                    cnt--;
                    if(cnt<0)cnt=n;
                    mainPrevSlide();
                }

            // 3. 자동타이머함수(4초 후 4초간격 계속)
            function autoTimer(){
                setId = setInterval(nextCount, 4000);
            }
            autoTimer();

            // 4. 페이지 이벤트 함수
            function pageEvent(){
                pageBtn.removeClass('on');
                pageBtn.eq( cnt> n ? 0 : cnt).addClass('on');
            }

            // 5. 페이지버튼클릭
            pageBtn.each(function(idx){
                $(this).on({
                    click(e){
                        e.preventDefault();
                        cnt=idx;
                        mainNextSlide();
                        clearInterval(setId); // 클릭시 일시중지
                    }
                });
            });

            // 6-1. 스톱 버튼 클릭이벤트
            stopBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.addClass('on');
                    playBtn.addClass('on');
                    clearInterval(setId); // 클릭시 일시중지
                }
            })

            // 6-2. 플레이 버튼 클릭이벤트
            playBtn.on({
                click(e){
                    e.preventDefault();
                    stopBtn.removeClass('on');
                    playBtn.removeClass('on');
                    autoTimer(); // 클릭시 재실행 7초후실행
                }
            })

            
        },
        section2(){
            //0. 변수설정
            let cnt = 0;
            let touchStart = null;
            let touchEnd = null;
            const slideWrap = $('#section2 .slide-wrap');
            const pageBtn = $('#section2 .page-btn');
            const selectBtn = $('#section2 .select-btn');
            const subMenu = $('#section2 .sub-menu');
            const materialIcons = $('#section2 .select-btn .material-icons');
            const slideContainer = $('#section2 .slide-container');
            const slideView = $('#section2 .slide-view');

             //드래그
             let dragStart = null; 
             let dragEnd = null;
             let winW = $(window).innerWidth();
             let mDown = false; 
             let sizeX = 100;
             let offsetLeft = slideWrap.offset().left; 

            // 터치스와이프
            //데스크탑 touchswap & drag and drop
            slideContainer.on({
                mousedown(e){
                    touchStart = e.clientX;
                    dragStart = e.clientX-(slideWrap.offset().left-offsetLeft);
                    mDown = true;
                    slideView.css({cursor:'grabbing'});
                },
                mouseup(e){
                    touchEnd = e.clientX;
                    //console.log(slideWrap.offset().left)
                    //console.log(e.offsetX - slideWrap.offset().left)
                if(touchStart-touchEnd > sizeX){
                    nextCount();
                }
                if(touchStart-touchEnd < -sizeX){
                    prevCount();
                }
                mDown = false;
                if(touchStart-touchEnd>=-sizeX && touchStart-touchEnd<=sizeX){
                    mainSlide();
                }
                slideView.css({cursor:'grab'});
                },
                mousemove(e){
                    if(mDown!==true){return;}
                    dragEnd = e.clientX;
                    slideWrap.css({left:dragEnd-dragStart});
                }
            });
        
            $(document).on({
                mouseup(e){
                //mDown = true; 상태에서
                //mouseup에서 mDown = false; 변경 > 이미 실행된 상태
                // 그러면 실행 못하게 막아라.
                if(!mDown) return; //마우스 다운 상태에서 마우스 업이 실행이 안된 상태에서만 실행하라.
                touchEnd = e.clientX;
                    //console.log(slideWrap.offset().left)
                    //console.log(e.offsetX - slideWrap.offset().left)
                if(touchStart-touchEnd > sizeX){
                    nextCount();
                }
                if(touchStart-touchEnd < -sizeX){
                    prevCount();
                }
                mDown = false;
                if(touchStart-touchEnd>=-sizeX && touchStart-touchEnd<=sizeX){
                    mainSlide();
                }
                slideView.css({cursor:'grab'});    
                }
            });

            //태블릿, 모바일 touchswap & drag and drop

            slideContainer.on({
                touchstart(e){
                    touchStart = e.originalEvent.changedTouches[0].clientX;
                    dragStart = e.originalEvent.changedTouches[0].clientX-(slideWrap.offset().left-offsetLeft);
                    mDown = true;
                    slideView.css({cursor:'grabbing'});
                },
                touchend(e){
                    touchEnd = e.originalEvent.changedTouches[0].clientX;
                    //console.log(slideWrap.offset().left)
                    //console.log(e.offsetX - slideWrap.offset().left)
                if(touchStart-touchEnd > sizeX){
                    nextCount();
                }
                if(touchStart-touchEnd < -sizeX){
                    prevCount();
                }
                mDown = false;
                if(touchStart-touchEnd>=-sizeX && touchStart-touchEnd<=sizeX){
                    mainSlide();
                }
                slideView.css({cursor:'grab'});
                },
                touchmove(e){
                    if(mDown!==true){return;}
                    dragEnd = e.originalEvent.changedTouches[0].clientX;
                    slideWrap.css({left:dragEnd-dragStart});
                }
            });

            //1.반응형만들기
            //1-1. 변수만들기
            const section2Container= $('#section2 .container');
            const slide= $('#section2 .slide-view .slide');
            const heightRate = 0.884545392; //너비에 대한 높이 비율(초기값)
            const slideH3 = $('#section2 .slide-view .slide h3');
            const slideH4 = $('#section2 .slide-view .slide h4');
            let slideWidth = (section2Container.innerWidth()-198+20+20)/3; // 슬라이드 1개의 너비, 마진이 내부에 포함된 상태. 488.333
            let n = slide.length-2; //슬라이드전체 길이(슬라이드의 갯수), 10개

            //1-2. 컨테이너 너비 구하기
            // console.log( $('#section2').innerWidth()); // section2 전체 컨테이너 너비 1903이 나와야해
            // console.log( (section2Container.innerWidth()-198+20+20)/3);
            // function = 여러 개의 명령을 하나로 묶는 것 

            
            resizeFn(); //로딩 시 실행

            function resizeFn(){
                if(winW <= 1642){ //1642px 이하에서 padding-left 값을 0으로 설정.
                    slideWidth = (section2Container.innerWidth()-0+20+20)/3;
                    //1280px 초과에서는 슬라이드 3개 노출
                    //1280px 이하에서는 슬라이드 1개만 노출
                    if(winW > 1280) {
                        slideWidth = (section2Container.innerWidth()-0+20+20)/3;
                        n = slide.length-2; // 8개
                        pageBtn.css({display: 'none'}); // 10개 모두 숨김
                        for(let i=0; i<n; i++){ //반복문 for 
                            pageBtn.eq(i).css({display: 'block'}); // 8개만 보임 0~7
                        }
                        if(cnt>=n-1){ //7
                            cnt=n-1;
                        }
                        // pageBtn.eq(8).css({display: 'none'});
                        // pageBtn.eq(9).css({display: 'none'}); // 슬라이드 페이지 버튼 갯수 변화 8개에서 1280px에서 10개로
                    }
                    else {
                        slideWidth = (section2Container.innerWidth()-0+20+20)/1;
                        n = slide.length;
                        pageBtn.css({display: 'block'}); // 10개 모두 보임
                        // pageBtn.eq(8).css({display: 'block'});
                        // pageBtn.eq(9).css({display: 'block'});
                    }
                }
                else{ // 1642px 초과하면 패딩값 그대로 있음  
                    slideWidth = (section2Container.innerWidth()-198+20+20)/3;
                    pageBtn.css({display: 'none'}); // 10개 모두 숨김
                    for(let i=0; i<n; i++){ //반복문 for 
                        pageBtn.eq(i).css({display: 'block'}); // 8개만 보임 0~8
                    }
                }
                winW = $(window).innerWidth(); // 창크기 바뀔 때 마다 창 너비를 계속 확인 시켜줌.
                slideWrap.css({width: slideWidth*10}); //슬라이드 전체박스
                slide.css({width: slideWidth, height: slideWidth*heightRate}); //슬라이드 1개
                slideH3.css({fontSize: slideWidth*0.066914548}); //폰트크기 비율로 바꿈.
                slideH4.css({fontSize: slideWidth*0.035687759});
                //mainSlide(); // 슬라이드 너비 전달하기 위해 호출
                slideWrap.stop().animate({left:-slideWidth * cnt}, 0);
            }
            
            // 가로 세로 크기가 1픽셀 이라도 변경되면 구동(실행)이 된다.
            // 가로 세로 크기가 변경이 안되면 구동이 없다. 영원히 그대로
            $(window).resize(function(){
                resizeFn();
            });


            //1. 메인슬라이드 함수
            // function mainSlide(){
            //     slideWrap.css({transition: `all 0.6s ease-in-out`});
            //     slideWrap.css({transform: `translateX(${-488.328*cnt}px)`});
            //     pageBtnEvent();
            // }
            function mainSlide(){
                 slideWrap.stop().animate({left:-slideWidth * cnt}, 600, 'easeInOutExpo');
                pageBtnEvent();
            }

            //셀렉트버튼 클릭 이벤트 => 토글 이벤트
            //셀렉트 버튼 한 번 클릭하면 서브메뉴 보이고
            //셀렉트 버튼 또 한 번 클릭하면 서브메뉴 숨긴다
            selectBtn.on({
                click(e){
                    e.preventDefault();
                    subMenu.toggleClass('on');
                    materialIcons.toggleClass('on');
                }
            });

            //다음카운트 함수
            function nextCount(){
                cnt++;
                if(cnt>n-1){cnt=n-1};
                mainSlide();
            }
            //이전카운트 함수
            function prevCount(){
                cnt--;
                if(cnt<0){cnt=0};
                mainSlide();
            }
            //2. 페이지버튼 클릭이벤트
            // each 매서드
            pageBtn.each(function(idx){
                $(this).on({
                    click(e){
                        e.preventDefault();
                        cnt=idx;
                        mainSlide();
                    }
                });

            });

            //3. 페이지버튼 이벤트 함수
            function pageBtnEvent(){
                pageBtn.removeClass('on');
                pageBtn.eq(cnt).addClass('on');
            }
            
        },
        section3(){},
    }
    obj.init();

})(jQuery); // 전달인수(아규먼트 Argument)
