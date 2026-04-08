import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'

import categoryRouter from './route/category.route.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import uploadRouter from './route/upload.router.js'


dotenv.config()

const app = express()

// ----------------------
// CORS FIX (VERY IMPORTANT)
// ----------------------

app.use(cors({
  origin: true,
  credentials: true
}))

// ----------------------
// MIDDLEWARE
// ----------------------

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use(helmet({
  crossOriginResourcePolicy: false
}))

// Debug cookies
app.use((req, res, next) => {
  console.log("Incoming cookies:", req.cookies)
  next()
})

// ----------------------
// ROOT ROUTE
// ----------------------

app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

// ----------------------
// API ROUTES
// ----------------------

app.use('/api/user', userRouter)
app.use("/api/category", categoryRouter)
app.use("/api/file", uploadRouter)
app.use("/api/subcategory", subCategoryRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/address", addressRouter)
app.use('/api/order', orderRouter)


// ----------------------
// DASHBOARD ROUTES
// ----------------------



// ----------------------
// DATABASE + SERVER START
// ----------------------

connectDB().then(() => {

  const PORT = process.env.PORT || 8080

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

})