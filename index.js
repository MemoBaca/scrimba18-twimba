import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

if (!localStorage.getItem("tweetsData")){
    localStorage.setItem("tweetsData",JSON.stringify(tweetsData))
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.replybtn){
        handleReplyBtnClick(e.target.dataset.replybtn)
    }
    else if(e.target.dataset.delete){
        handleDeleteBtnClick(e.target.dataset.delete)
    }
    else if(e.target.dataset.deletereply){
        handleDeleteReplyClick(e.target.dataset.deletereply,e.target.dataset.uuid)
    }
})
 
function handleLikeClick(tweetId){
    let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
    const targetTweetObj = tweetsJSON.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
    render()
}

function handleRetweetClick(tweetId){
    let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
    const targetTweetObj = tweetsJSON.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
        tweetsJSON.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4(),
            isDeletable: true,
        })
        localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
        render()
        tweetInput.value = ''
    }
    
}

function handleReplyBtnClick(replyId){
    let txtareas = document.getElementsByTagName("textarea")
    let replyInput = Array.from(txtareas).filter(function(txtarea){
        return txtarea.dataset.replytxtarea === replyId
    })[0]
    if(replyInput.value){
        let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
        const targetTweetObj = tweetsJSON.filter(function(tweet){
            return tweet.uuid === replyId
        })[0]
        targetTweetObj.replies.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: `${replyInput.value}`,
            isDeletable: true,
            uuid: uuidv4(),
        })
        localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
    render()
    replyInput.value = ''
    }
}

function handleDeleteBtnClick(deleteId){
    let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
    for (let i=0; i<tweetsJSON.length;i++){
        if (tweetsJSON[i].uuid===deleteId){
            tweetsJSON.splice(i,1)
            localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
            render()
            break
        }
    }
}

function handleDeleteReplyClick(tweetUUID,replyUUID){
    let tweetsJSON = JSON.parse(localStorage.getItem("tweetsData"))
    for (let tweet of tweetsJSON) {
        if (tweet.uuid === tweetUUID){
            for (let i=0;i<tweet.replies.length;i++){
                if (tweet.replies[i].uuid==replyUUID){
                    tweet.replies.splice(i,1)
                    break
                }
            }
            localStorage.setItem("tweetsData",JSON.stringify(tweetsJSON))
            render()
            break
        }
    }

}

function getFeedHtml(){
    let feedHtml = ``
    
    JSON.parse(localStorage.getItem("tweetsData")).forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = `
        <div class="reply-input-area">
			<img src="images/scrimbalogo.png" class="profile-pic">
			<textarea placeholder="Reply" data-replytxtarea="${tweet.uuid}"></textarea>
		</div>
		<button data-replybtn="${tweet.uuid}">Reply</button>
        `
        let deletableHtml = (tweet.isDeletable) ? `<p class="delete" data-delete="${tweet.uuid}">&times;<p>` : ''

        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                let dataUUID = (reply.uuid) ? reply.uuid : ""
                let deletableHtmlReplies = (reply.isDeletable) ? 
                `<p class="delete" data-deletereply="${tweet.uuid}" data-uuid="${dataUUID}">&times;<p>` : '' 
                repliesHtml+=`
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                            <div>
                                <p class="handle">${reply.handle}</p>
                                <p class="tweet-text">${reply.tweetText}</p>
                            </div>
                            ${deletableHtmlReplies}
                    </div> 
                </div>
                `
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>
        ${deletableHtml}         
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

