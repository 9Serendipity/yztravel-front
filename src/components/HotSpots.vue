<template>
  <el-row class="hot-spots-section">
    <el-col :span="24">
      <div class="hot-spots-container">
        <h2 class="section-title">热门景点</h2>
        <el-table 
          :data="paginatedSpots" 
          style="width: 100%" 
          :show-header="false"
          @row-click="handleSpotClick"
        >
          <el-table-column width="50">
            <template slot-scope="scope">
              <div class="rank-number">{{ scope.$index + 1 }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="name">
            <template slot-scope="scope">
              <span class="spot-name" :class="{ 'clickable': true }">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120">
            <template slot-scope="scope">
              <el-rate v-model="scope.row.rating" disabled text-color="#ff9900">
              </el-rate>
            </template>
          </el-table-column>
          <el-table-column width="120" align="right">
            <template slot-scope="scope">
              <span class="visit-count">
                <i class="el-icon-view"></i>
                {{ scope.row.visitCount }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 添加分页组件 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="sortedSpots.length">
          </el-pagination>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HotSpots',
  data() {
    return {
      spots: [],
      currentPage: 1,  // 添加分页相关数据
      pageSize: 5
    }
  },
  methods: {
    async handleSpotClick(row) {
        try {
            const response = await axios.get(`/api/spots/attractions/name/${row.name}`)
            if (response.data.code === 1) {
                // 修改：获取数组中的第一个元素
                const spotData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data
                
                if (!spotData || !spotData.id) {
                    console.error('景点数据不完整:', spotData)
                    this.$message.error('景点信息不完整')
                    return
                }
                
                localStorage.setItem('selectedSpot', JSON.stringify(spotData))
                // 修改为路径参数方式跳转
                this.$router.push(`/routes/${spotData.id}`)
            } else {
                this.$message.error('获取景点信息失败')
            }
        } catch (error) {
            console.error('获取景点信息失败:', error)
            this.$message.error('获取景点信息失败')
        }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    async loadSpots() {
      try {
        const response = await axios.get('/api/spots/all')
        if (response.data.code === 1) {
          this.spots = response.data.data
        } else {
          this.$message.error('获取景点列表失败')
        }
      } catch (error) {
        console.error('获取景点列表失败:', error)
        this.$message.error('获取景点列表失败')
      }
    }
  },
  computed: {
    sortedSpots() {
      // 根据访问量和评分进行排序
      return [...this.spots].sort((a, b) => {
        // 协同过滤的权重计算
        const weightA = a.visitCount * 0.7 + a.rating * 0.3
        const weightB = b.visitCount * 0.7 + b.rating * 0.3
        return weightB - weightA
      })
    },
    paginatedSpots() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedSpots.slice(start, end)
    }
  },
  async created() {
    await this.loadSpots()
  }
}
</script>

<style scoped>
.hot-spots-section {
  margin-top: 40px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.hot-spots-container {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
}

.section-title {
  font-family: "楷体", "KaiTi", serif;
  font-size: 24px;
  color: #57573e;
  margin-bottom: 20px;
  text-align: center;
}

.rank-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #967171;
  color: white;
  border-radius: 50%;
  font-size: 14px;
}

.spot-name {
  font-family: "楷体", "KaiTi", serif;
  font-size: 16px;
  color: #57573e;
}

.visit-count {
  color: #909399;
  font-size: 14px;
}

.visit-count i {
  margin-right: 5px;
}

.clickable {
  cursor: pointer;
  color: #57573e;
  transition: color 0.3s;
}

.clickable:hover {
  color: #967171;
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>