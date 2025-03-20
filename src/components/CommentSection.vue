<template>
  <div class="comments-section">
    <h3>游客评论</h3>
    
    <!-- 评论列表 -->
    <div class="comment-list" v-if="comments.length > 0">
      <div class="comment-item" v-for="(comment, index) in comments" :key="index">
        <div class="comment-header">
          <span class="comment-author">{{ comment.username }}</span>
          <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
          <el-rate v-model="comment.rating" disabled text-color="#ff9900"></el-rate>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
      </div>
    </div>
    <div v-else class="no-comments">暂无评论，快来发表第一条评论吧！</div>
    
    <!-- 发表评论 -->
    <div class="comment-form">
      <h4>发表评论</h4>
      <el-form>
        <el-form-item>
          <el-rate v-model="newComment.rating" show-text></el-rate>
        </el-form-item>
        <el-form-item>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="分享你的游览体验..."
            v-model="newComment.content">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitComment">发表评论</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CommentSection',
  props: {
    attractionId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      newComment: {
        content: '',
        rating: 5,
        attractionId: null
      }
    }
  },
  watch: {
    attractionId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.newComment.attractionId = newVal
          this.loadComments()
        }
      }
    }
  },
  methods: {
    async loadComments() {
      try {
        const response = await axios.get(`/api/comments/${this.attractionId}`)
        if (response.data.code === 1) {
          this.comments = response.data.data || []
        } else {
          this.$message.warning('加载评论失败')
        }
      } catch (error) {
        console.error('加载评论失败:', error)
        this.$message.error('加载评论失败，请稍后重试')
      }
    },
    
    async submitComment() {
      if (!this.newComment.content.trim()) {
        this.$message.warning('评论内容不能为空')
        return
      }
      
      try {
        const userInfoStr = localStorage.getItem('user')
        console.log('localStorage中的user:', userInfoStr)
        
        if (!userInfoStr) {
          this.$message.warning('未找到用户信息，请重新登录')
          this.$router.push('/login')
          return
        }

        const userInfo = JSON.parse(userInfoStr)
        console.log('解析后的user:', userInfo)

        if (!userInfo || typeof userInfo !== 'object') {
          this.$message.warning('用户信息格式错误，请重新登录')
          this.$router.push('/login')
          return
        }

        // 修改字段名检查
        if (!userInfo.usersId || !userInfo.name) {
          this.$message.warning('用户信息不完整，请重新登录')
          this.$router.push('/login')
          return
        }
        
        const commentData = {
          ...this.newComment,
          userId: userInfo.usersId,  // 修改为 usersId
          username: userInfo.name    // 修改为 name
        }
        
        const response = await axios.post('/api/comments/add', commentData)
        if (response.data.code === 1) {
          this.$message.success('评论发表成功')
          // 重置评论表单
          this.newComment.content = ''
          this.newComment.rating = 5
          // 重新加载评论
          this.loadComments()
        } else {
          this.$message.error(response.data.msg || '评论发表失败')
        }
      } catch (error) {
        console.error('提交评论失败:', error)
        this.$message.error('评论发表失败，请稍后重试')
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.comments-section {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-list {
  margin: 20px 0;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  margin-right: 10px;
}

.comment-time {
  color: #999;
  font-size: 12px;
  margin-right: 10px;
}

.comment-content {
  line-height: 1.6;
  color: #333;
}

.no-comments {
  color: #999;
  text-align: center;
  padding: 20px;
}

.comment-form {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>