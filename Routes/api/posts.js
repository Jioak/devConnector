const express=require('express')
const router=express.Router();
const {check,validationResult}=require('express-validator')
const auth=require('../../middleware/auth');
const Post=require('../../models/Post');
const User=require('../../models/User')

// @route   Post api/posts
// @desc     Create a post

// @access   Private



router.post('/',[auth,[
check('text',',Text is required').not().isEmpty()
]],async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
try{
const user= await User.findById(req.user.id).select('-password');

const newPost= new Post({
    text:req.body.text,
    name:user.name,
    avatar:user.avatar,
    user:req.user.id
})

const post=await newPost.save();

res.json(post)


} catch(error){
    console.error(error.message);
    res.status(500).send('server error')
}

})


// @route    Get api/posts
// @desc  get all Post

// @access   Private


router.get('/',auth,async(req,res)=>{

    try {

        const posts=await Post.find().sort({data:-1});

        res.json(posts)

        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})


// @route    Get api/posts/:id
// @desc  get Post by Id

// @access   Private


router.get('/:id',auth,async(req,res)=>{

    try {

        const post=await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }

        res.json(post)

        
    } catch (error) {

        if(error.kind ==='ObjectId'){
            return res.status(404).json({msg:'Post not Found'})
        }
        console.error(error.message);
        res.status(500).send('server error')
    }
})



// @route    delete api/posts/:id
// @desc  delete Post by Id

// @access   Private



router.delete('/:id',auth,async(req,res)=>{

    try {
        const post=await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }

        if(post.user.toString()!== req.user.id){
            return res.status(401).json({msg:'user not authorized'})

        }

        await post.deleteOne()
        res.json({msg:'post removed'})

    } catch (error) {
          console.error(error.message);
          if(error.kind ==='ObjectId'){
            return res.status(404).json({msg:'Post not Found'})
        }
  res.status(500).send('server error')
    }
})


// @route    put api/posts/:id
// @desc  Like a Post 

// @access   Private

router.put('/like/:id',auth,async(req,res)=> {

    try {

        const post =await Post.findById(req.params.id);

        if(post.likes.filter(like =>like.user.toString()===req.user.id).length >0){

            return res.status(400).json({msg:'Post already liked'})
        }

        post.likes.unshift({user:req.user.id});

        await post.save()

        res.json(post.likes)

        
    } catch (error) {
        console.error(error.message);
        if(error.kind ==='ObjectId'){
          return res.status(404).json({msg:'Post not Found'})
      }
res.status(500).send('server error')
    }
})




// @route    put api/posts/:id
// @desc  unLike a Post 

// @access   Private

router.put('/unlike/:id',auth,async(req,res)=> {

    try {

        const post =await Post.findById(req.params.id);

        if(post.likes.filter(like =>like.user.toString()===req.user.id).length ===0){

            return res.status(400).json({msg:'Post has not yet been liked'})
        }

        const removeIndex=post.likes.
        map(like=>like.user.toString()).indexOf(req.user.id);


        post.likes.splice(removeIndex,1)
        

        await post.save()

        res.json(post.likes)

        
    } catch (error) {
        console.error(error.message);
        if(error.kind ==='ObjectId'){
          return res.status(404).json({msg:'Post not Found'})
      }
res.status(500).send('server error')
    }
})

// @route Post api/posts/comment/:id
// @desc Comment on a post
//@access Privte



router.post('/comment/:id',[auth,[
    check('text','text is required').not().isEmpty()
]],async(req,res)=>{



const errors=validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({
        errors:errors.array()
    })
}

try {

    const user= await User.findById(req.user.id).select('-password');

    const post =await Post.findById(req.params.id);

    const newComment={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    }
    post.comments.unshift(newComment)
    
    await post.save();

    res.json(post.comments)
} catch (error) {
    console.error(error.message);
    res.status(500).send('server error')
}

})


// @route delete api/posts/comment/:id
// @desc  delete Comment on a post
//@access Privte

router.delete('/comment/:id/:comment_id',auth,async (req,res)=> {

    try {
        const post=await Post.findById(req.params.id);

        const comment=post.comments.find(
            comment =>comment.id === req.params.comment_id);

            if(!comment){
                return res.status(404).json({msg:'Comment does not exist'})
            }

            if(comment.user.toString() !== req.user.id){
return res.status(401).json({msg:'user not authorized'})
            }

            const removeIndex=post.comments.
            map(comment=>comment.user.toString()).indexOf(req.user.id);
            post.comments.splice(removeIndex,1)
            
            await post.save()
            res.json(post.comments)
        
        
    } catch (error) {
        console.error(error.message);
res.status(500).send('server error')
    }
})

module.exports=router
