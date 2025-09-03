"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  Apple,
  Calculator,
  TrendingUp,
  Target,
  Activity,
  Plus,
  Trash2,
  Utensils,
  User,
  Zap,
  LogOut,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Calendar,
  MapPin,
  Dumbbell,
  Sun,
  Moon,
  Coffee,
  Search,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { useAuth } from "@/components/auth-context"
import LoginForm from "@/components/login-form"

interface WeightEntry {
  id: string
  date: string
  weight: number
  note?: string
}

interface CalorieEntry {
  id: string
  date: string
  mealName: string
  carbs: number
  protein: number
  fat: number
  totalCalories: number
  note?: string
}

interface PersonalInfo {
  height: string
  age: string
  gender: "male" | "female"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
}

interface CalorieResults {
  bmr: number
  tdee: number
  weightLoss: number
  weightGain: number
}

interface WeightGoal {
  currentWeight: number
  targetWeight: number
  goalType: "lose" | "gain" | "maintain"
  timeframe: number // weeks
  weeklyTarget: number // kg per week
}

export default function HealthTracker() {
  const { user, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState("")
  const [newNote, setNewNote] = useState("")

  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([])
  const [newMealName, setNewMealName] = useState("")
  const [newCarbs, setNewCarbs] = useState("")
  const [newProtein, setNewProtein] = useState("")
  const [newFat, setNewFat] = useState("")
  const [newCalorieNote, setNewCalorieNote] = useState("")

  const [personalInfo, setPersonalInfo] = useState({
    height: "",
    age: "",
    gender: "male" as "male" | "female",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "active" | "very_active",
  })
  const [calorieResults, setCalorieResults] = useState<CalorieResults | null>(null)

  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null)
  const [goalCurrentWeight, setGoalCurrentWeight] = useState("")
  const [goalTargetWeight, setGoalTargetWeight] = useState("")
  const [goalType, setGoalType] = useState<"lose" | "gain" | "maintain">("lose")
  const [goalTimeframe, setGoalTimeframe] = useState("")

  const foodDatabase = {
    // Grains & Starches (per 100g)
    "cơm trắng": { calories: 130, carbs: 28, protein: 2.7, fat: 0.3 },
    "cơm gạo lứt": { calories: 111, carbs: 23, protein: 2.6, fat: 0.9 },
    "bánh mì": { calories: 265, carbs: 49, protein: 9, fat: 3.2 },
    phở: { calories: 85, carbs: 17, protein: 3, fat: 0.5 },
    bún: { calories: 109, carbs: 25, protein: 2.2, fat: 0.1 },
    mì: { calories: 138, carbs: 25, protein: 4.5, fat: 0.9 },

    // Proteins (per 100g)
    "thịt bò": { calories: 250, carbs: 0, protein: 26, fat: 15 },
    "thịt heo": { calories: 242, carbs: 0, protein: 27, fat: 14 },
    "thịt gà": { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
    cá: { calories: 206, carbs: 0, protein: 22, fat: 12 },
    tôm: { calories: 99, carbs: 0.2, protein: 24, fat: 0.3 },
    "trứng gà": { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
    "đậu hũ": { calories: 76, carbs: 1.9, protein: 8, fat: 4.8 },

    // Vegetables (per 100g)
    "rau cải": { calories: 13, carbs: 2.2, protein: 1.5, fat: 0.2 },
    "cà chua": { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
    "dưa chuột": { calories: 16, carbs: 4, protein: 0.7, fat: 0.1 },
    "cà rốt": { calories: 41, carbs: 10, protein: 0.9, fat: 0.2 },
    "khoai tây": { calories: 77, carbs: 17, protein: 2, fat: 0.1 },
    "khoai lang": { calories: 86, carbs: 20, protein: 1.6, fat: 0.1 },

    // Fruits (per 100g)
    chuối: { calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
    táo: { calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
    cam: { calories: 47, carbs: 12, protein: 0.9, fat: 0.1 },
    xoài: { calories: 60, carbs: 15, protein: 0.8, fat: 0.4 },
    nho: { calories: 62, carbs: 16, protein: 0.6, fat: 0.2 },
    "dưa hấu": { calories: 30, carbs: 8, protein: 0.6, fat: 0.2 },

    // Dairy (per 100g)
    "sữa tươi": { calories: 42, carbs: 5, protein: 3.4, fat: 1 },
    "sữa chua": { calories: 59, carbs: 3.6, protein: 10, fat: 0.4 },
    "phô mai": { calories: 113, carbs: 4, protein: 11, fat: 6 },

    // Nuts & Seeds (per 100g)
    "đậu phộng": { calories: 567, carbs: 16, protein: 26, fat: 49 },
    "hạnh nhân": { calories: 579, carbs: 22, protein: 21, fat: 50 },
    "óc chó": { calories: 654, carbs: 14, protein: 15, fat: 65 },
  }

  const [foodAnalyzer, setFoodAnalyzer] = useState({
    foodName: "",
    weight: "",
    results: null as any,
  })

  const searchFood = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return Object.keys(foodDatabase)
      .filter((food) => food.includes(lowerQuery))
      .slice(0, 5)
  }

  const analyzeFood = () => {
    const foodName = foodAnalyzer.foodName.toLowerCase()
    const weight = Number(foodAnalyzer.weight)

    if (!foodName || !weight || weight <= 0) return

    const foodData = foodDatabase[foodName as keyof typeof foodDatabase]
    if (!foodData) return

    const multiplier = weight / 100
    const results = {
      foodName: foodAnalyzer.foodName,
      weight: weight,
      calories: foodData.calories * multiplier,
      carbs: foodData.carbs * multiplier,
      protein: foodData.protein * multiplier,
      fat: foodData.fat * multiplier,
    }

    setFoodAnalyzer((prev) => ({ ...prev, results }))
  }

  const addAnalyzedFood = () => {
    if (!foodAnalyzer.results || !user) return

    const { results } = foodAnalyzer
    setNewMealName(`${results.foodName} (${results.weight}g)`)
    setNewCarbs(results.carbs.toFixed(1))
    setNewProtein(results.protein.toFixed(1))
    setNewFat(results.fat.toFixed(1))

    // Clear analyzer
    setFoodAnalyzer({ foodName: "", weight: "", results: null })
  }

  useEffect(() => {
    const savedWeights = localStorage.getItem(`healthTracker_weights_${user?.id}`)
    if (savedWeights) {
      setWeightEntries(JSON.parse(savedWeights))
    }

    const savedCalories = localStorage.getItem(`healthTracker_calories_${user?.id}`)
    if (savedCalories) {
      setCalorieEntries(JSON.parse(savedCalories))
    }

    const savedPersonalInfo = localStorage.getItem(`healthTracker_personalInfo_${user?.id}`)
    if (savedPersonalInfo) {
      setPersonalInfo(JSON.parse(savedPersonalInfo))
    }

    const savedWeightGoal = localStorage.getItem(`healthTracker_weightGoal_${user?.id}`)
    if (savedWeightGoal) {
      setWeightGoal(JSON.parse(savedWeightGoal))
    }
  }, [user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`healthTracker_weights_${user.id}`, JSON.stringify(weightEntries))
    }
  }, [weightEntries, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`healthTracker_calories_${user.id}`, JSON.stringify(calorieEntries))
    }
  }, [calorieEntries, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`healthTracker_personalInfo_${user.id}`, JSON.stringify(personalInfo))
    }
  }, [personalInfo, user])

  useEffect(() => {
    if (user && weightGoal) {
      localStorage.setItem(`healthTracker_weightGoal_${user.id}`, JSON.stringify(weightGoal))
    }
  }, [weightGoal, user])

  const addWeightEntry = () => {
    if (!newWeight || isNaN(Number(newWeight))) return

    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      weight: Number(newWeight),
      note: newNote.trim() || undefined,
    }

    setWeightEntries((prev) => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    setNewWeight("")
    setNewNote("")
  }

  const addCalorieEntry = () => {
    if (!newMealName.trim() || !newCarbs || !newProtein || !newFat) return
    if (isNaN(Number(newCarbs)) || isNaN(Number(newProtein)) || isNaN(Number(newFat))) return

    const carbs = Number(newCarbs)
    const protein = Number(newProtein)
    const fat = Number(newFat)
    const totalCalories = carbs * 4 + protein * 4 + fat * 9

    const entry: CalorieEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      mealName: newMealName.trim(),
      carbs,
      protein,
      fat,
      totalCalories,
      note: newCalorieNote.trim() || undefined,
    }

    setCalorieEntries((prev) =>
      [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    )
    setNewMealName("")
    setNewCarbs("")
    setNewProtein("")
    setNewFat("")
    setNewCalorieNote("")
  }

  const calculateBMR = (info: PersonalInfo): number => {
    // Mifflin-St Jeor Equation
    if (info.gender === "male") {
      return 10 * Number(info.weight) + 6.25 * Number(info.height) - 5 * Number(info.age) + 5
    } else {
      return 10 * Number(info.weight) + 6.25 * Number(info.height) - 5 * Number(info.age) - 161
    }
  }

  const getActivityMultiplier = (activityLevel: string): number => {
    const multipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    }
    return multipliers[activityLevel] || 1.2
  }

  const calculateCalories = () => {
    if (!personalInfo.age || !personalInfo.weight || !personalInfo.height || !personalInfo.activityLevel) {
      return
    }

    const bmr = calculateBMR(personalInfo)
    const tdee = bmr * getActivityMultiplier(personalInfo.activityLevel)

    const results: CalorieResults = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLoss: Math.round(tdee - 500), // 500 calorie deficit for weight loss
      weightGain: Math.round(tdee + 500), // 500 calorie surplus for weight gain
    }

    setCalorieResults(results)
  }

  const createWeightGoal = () => {
    if (!goalCurrentWeight || !goalTargetWeight || !goalTimeframe) return
    if (isNaN(Number(goalCurrentWeight)) || isNaN(Number(goalTargetWeight)) || isNaN(Number(goalTimeframe))) return

    const current = Number(goalCurrentWeight)
    const target = Number(goalTargetWeight)
    const weeks = Number(goalTimeframe)

    const weightDifference = Math.abs(target - current)
    const weeklyTarget = weightDifference / weeks

    const goal: WeightGoal = {
      currentWeight: current,
      targetWeight: target,
      goalType: goalType,
      timeframe: weeks,
      weeklyTarget: weeklyTarget,
    }

    setWeightGoal(goal)
    setGoalCurrentWeight("")
    setGoalTargetWeight("")
    setGoalTimeframe("")
  }

  const generateRoadmap = (goal: WeightGoal) => {
    if (!calorieResults) return null

    const isLosing = goal.goalType === "lose"
    const weeklyCalorieDeficit = goal.weeklyTarget * 7700 // 1kg = 7700 kcal
    const dailyCalorieAdjustment = Math.round(weeklyCalorieDeficit / 7)

    const targetCalories = isLosing
      ? calorieResults.tdee - dailyCalorieAdjustment
      : goal.goalType === "gain"
        ? calorieResults.tdee + dailyCalorieAdjustment
        : calorieResults.tdee

    const macroSuggestions = {
      protein: Math.round((targetCalories * 0.25) / 4), // 25% protein
      carbs: Math.round((targetCalories * 0.45) / 4), // 45% carbs
      fat: Math.round((targetCalories * 0.3) / 9), // 30% fat
    }

    return {
      targetCalories,
      macroSuggestions,
      weeklyMilestones: Array.from({ length: Math.min(goal.timeframe, 12) }, (_, i) => ({
        week: i + 1,
        targetWeight: goal.currentWeight + (goal.targetWeight - goal.currentWeight) * ((i + 1) / goal.timeframe),
      })),
    }
  }

  const deleteWeightEntry = (id: string) => {
    setWeightEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const deleteCalorieEntry = (id: string) => {
    setCalorieEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getCurrentWeight = () => {
    if (weightEntries.length === 0) return null
    return weightEntries[weightEntries.length - 1].weight
  }

  const getWeightChange = () => {
    if (weightEntries.length < 2) return null
    const current = weightEntries[weightEntries.length - 1].weight
    const previous = weightEntries[weightEntries.length - 2].weight
    return current - previous
  }

  const getTodayCalories = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayEntries = calorieEntries.filter((entry) => entry.date === today)
    return todayEntries.reduce((total, entry) => total + entry.totalCalories, 0)
  }

  const getTodayMacros = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayEntries = calorieEntries.filter((entry) => entry.date === today)
    return todayEntries.reduce(
      (totals, entry) => ({
        carbs: totals.carbs + entry.carbs,
        protein: totals.protein + entry.protein,
        fat: totals.fat + entry.fat,
      }),
      { carbs: 0, protein: 0, fat: 0 },
    )
  }

  // Prepare chart data
  const chartData = weightEntries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    weight: entry.weight,
  }))

  const todayMacros = getTodayMacros()
  const pieData = [
    { name: "Carbs", value: todayMacros.carbs * 4, color: "hsl(var(--chart-1))" },
    { name: "Protein", value: todayMacros.protein * 4, color: "hsl(var(--chart-2))" },
    { name: "Fat", value: todayMacros.fat * 9, color: "hsl(var(--chart-3))" },
  ].filter((item) => item.value > 0)

  const macroBarData = [
    { name: "Carbs", grams: todayMacros.carbs, calories: todayMacros.carbs * 4 },
    { name: "Protein", grams: todayMacros.protein, calories: todayMacros.protein * 4 },
    { name: "Fat", grams: todayMacros.fat, calories: todayMacros.fat * 9 },
  ]

  const getWeightTrend = () => {
    if (weightEntries.length < 3) return null

    const recent = weightEntries.slice(-3)
    const trend = recent[2].weight - recent[0].weight

    if (Math.abs(trend) < 0.5) return "stable"
    return trend > 0 ? "increasing" : "decreasing"
  }

  const getCalorieAnalysis = () => {
    if (!calorieResults) return null

    const last7Days = calorieEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    if (last7Days.length === 0) return null

    const avgCalories = last7Days.reduce((sum, entry) => sum + entry.totalCalories, 0) / last7Days.length
    const targetCalories = calorieResults.tdee

    const difference = avgCalories - targetCalories
    const percentDiff = (difference / targetCalories) * 100

    return {
      avgCalories: Math.round(avgCalories),
      targetCalories,
      difference: Math.round(difference),
      percentDiff: Math.round(percentDiff),
      status: Math.abs(percentDiff) < 10 ? "good" : percentDiff > 10 ? "high" : "low",
    }
  }

  const getMacroBalance = () => {
    const last7Days = calorieEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    if (last7Days.length === 0) return null

    const totalCarbs = last7Days.reduce((sum, entry) => sum + entry.carbs, 0)
    const totalProtein = last7Days.reduce((sum, entry) => sum + entry.protein, 0)
    const totalFat = last7Days.reduce((sum, entry) => sum + entry.fat, 0)

    const totalCalories = totalCarbs * 4 + totalProtein * 4 + totalFat * 9

    const carbPercent = ((totalCarbs * 4) / totalCalories) * 100
    const proteinPercent = ((totalProtein * 4) / totalCalories) * 100
    const fatPercent = ((totalFat * 9) / totalCalories) * 100

    return {
      carbs: Math.round(carbPercent),
      protein: Math.round(proteinPercent),
      fat: Math.round(fatPercent),
    }
  }

  const generateAdvice = () => {
    const advice = []
    const weightTrend = getWeightTrend()
    const calorieAnalysis = getCalorieAnalysis()
    const macroBalance = getMacroBalance()

    // Weight trend advice
    if (weightTrend === "increasing") {
      advice.push({
        type: "warning",
        title: "Cân nặng đang tăng",
        message:
          "Cân nặng của bạn có xu hướng tăng trong những lần đo gần đây. Hãy xem xét giảm lượng calo tiêu thụ hoặc tăng cường vận động.",
        icon: AlertTriangle,
      })
    } else if (weightTrend === "decreasing") {
      advice.push({
        type: "success",
        title: "Cân nặng đang giảm",
        message: "Tuyệt vời! Cân nặng của bạn đang có xu hướng giảm. Hãy duy trì chế độ ăn uống và tập luyện hiện tại.",
        icon: CheckCircle,
      })
    } else if (weightTrend === "stable") {
      advice.push({
        type: "info",
        title: "Cân nặng ổn định",
        message: "Cân nặng của bạn đang duy trì ổn định. Đây là dấu hiệu tốt cho việc duy trì sức khỏe.",
        icon: Info,
      })
    }

    // Calorie analysis advice
    if (calorieAnalysis) {
      if (calorieAnalysis.status === "high") {
        advice.push({
          type: "warning",
          title: "Ăn nhiều hơn mức cần thiết",
          message: `Bạn đang ăn trung bình ${calorieAnalysis.avgCalories} kcal/ngày, cao hơn ${Math.abs(calorieAnalysis.difference)} kcal so với mức cần thiết. Hãy giảm khẩu phần hoặc chọn thực phẩm ít calo hơn.`,
          icon: AlertTriangle,
        })
      } else if (calorieAnalysis.status === "low") {
        advice.push({
          type: "warning",
          title: "Ăn ít hơn mức cần thiết",
          message: `Bạn đang ăn trung bình ${calorieAnalysis.avgCalories} kcal/ngày, thấp hơn ${Math.abs(calorieAnalysis.difference)} kcal so với mức cần thiết. Hãy tăng khẩu phần để đảm bảo đủ năng lượng.`,
          icon: AlertTriangle,
        })
      } else {
        advice.push({
          type: "success",
          title: "Lượng calo phù hợp",
          message: `Bạn đang duy trì lượng calo phù hợp với nhu cầu (${calorieAnalysis.avgCalories} kcal/ngày). Tiếp tục duy trì!`,
          icon: CheckCircle,
        })
      }
    }

    // Macro balance advice
    if (macroBalance) {
      if (macroBalance.protein < 15) {
        advice.push({
          type: "tip",
          title: "Cần tăng protein",
          message: `Protein chỉ chiếm ${macroBalance.protein}% tổng calo. Hãy thêm thịt nạc, cá, trứng, đậu phụ vào bữa ăn để đạt 15-25%.`,
          icon: Lightbulb,
        })
      }

      if (macroBalance.carbs > 60) {
        advice.push({
          type: "tip",
          title: "Giảm carbs tinh chế",
          message: `Carbs chiếm ${macroBalance.carbs}% tổng calo, hơi cao. Hãy thay thế carbs tinh chế bằng carbs phức hợp như yến mạch, gạo lứt.`,
          icon: Lightbulb,
        })
      }

      if (macroBalance.fat < 20) {
        advice.push({
          type: "tip",
          title: "Cần thêm chất béo tốt",
          message: `Chất béo chỉ chiếm ${macroBalance.fat}% tổng calo. Hãy thêm dầu olive, quả bơ, hạt để đạt 20-35%.`,
          icon: Lightbulb,
        })
      }
    }

    // General tips
    if (advice.length === 0) {
      advice.push({
        type: "tip",
        title: "Mẹo sức khỏe",
        message:
          "Hãy duy trì việc ghi chép thường xuyên để AI có thể đưa ra lời khuyên chính xác hơn. Uống đủ nước và ngủ đủ giấc cũng rất quan trọng!",
        icon: Lightbulb,
      })
    }

    return advice
  }

  const generateMealPlan = (roadmap: any, goalType: string) => {
    const mealPlans = {
      lose: {
        breakfast: [
          "Yến mạch với trái cây và hạt (300 kcal)",
          "Trứng luộc + bánh mì nguyên cám + rau (280 kcal)",
          "Sữa chua Hy Lạp + quả berry + granola (250 kcal)",
          "Smoothie xanh với rau bina + chuối + protein (270 kcal)",
        ],
        lunch: [
          "Cơm gạo lứt + thịt nạc nướng + rau xào (450 kcal)",
          "Salad gà nướng với quinoa và rau củ (420 kcal)",
          "Phở gà không dầu mỡ + rau thơm (380 kcal)",
          "Cơm + cá hấp + canh rau (400 kcal)",
        ],
        dinner: [
          "Cá nướng + rau củ hấp + khoai lang (350 kcal)",
          "Tôm xào rau củ + cơm gạo lứt (320 kcal)",
          "Thịt bò nạc + salad rau trộn (300 kcal)",
          "Đậu phụ xào rau + súp miso (280 kcal)",
        ],
        snacks: [
          "Táo + 10 hạt hạnh nhân (120 kcal)",
          "Cà rốt baby + hummus (100 kcal)",
          "Sữa chua không đường (80 kcal)",
          "Trái cây theo mùa (60-100 kcal)",
        ],
      },
      gain: {
        breakfast: [
          "Yến mạch + chuối + bơ đậu phộng + sữa (450 kcal)",
          "Bánh mì sandwich trứng + phô mai + bơ (500 kcal)",
          "Smoothie protein + yến mạch + trái cây (480 kcal)",
          "Trứng chiên + bánh mì + bơ + sữa (520 kcal)",
        ],
        lunch: [
          "Cơm + thịt bò xào + rau + canh (650 kcal)",
          "Mì Ý sốt kem + thịt gà + phô mai (700 kcal)",
          "Cơm gà teriyaki + rau củ + súp (680 kcal)",
          "Bánh mì thịt nướng + khoai tây chiên (720 kcal)",
        ],
        dinner: [
          "Cá hồi nướng + cơm + rau xào dầu ô liu (600 kcal)",
          "Thịt heo nướng + khoai lang + salad (580 kcal)",
          "Gà nướng + pasta + rau (620 kcal)",
          "Bò bít tết + khoai tây nghiền + rau (650 kcal)",
        ],
        snacks: [
          "Hạt hỗn hợp + sữa chua (200 kcal)",
          "Bánh protein + chuối (180 kcal)",
          "Bơ đậu phộng + bánh crackers (220 kcal)",
          "Smoothie protein + yến mạch (250 kcal)",
        ],
      },
    }

    return goalType === "maintain" ? mealPlans.lose : mealPlans[goalType as keyof typeof mealPlans]
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Health Tracker</h1>
                <p className="text-sm text-muted-foreground">Theo dõi sức khỏe cá nhân</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {user && (
                  <>
                    <p className="text-sm font-medium text-foreground">Xin chào, {user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </>
                )}
              </div>
              {user && (
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Cân nặng
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Calo
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Tính toán
            </TabsTrigger>
            <TabsTrigger value="advisor" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Advisor
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Weight Overview Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Scale className="w-5 h-5 text-primary" />
                    Cân nặng hiện tại
                  </CardTitle>
                  <CardDescription>Theo dõi xu hướng thay đổi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {getCurrentWeight() ? `${getCurrentWeight()} kg` : "--.- kg"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getWeightChange() !== null ? (
                      <span className={getWeightChange()! > 0 ? "text-red-500" : "text-green-500"}>
                        {getWeightChange()! > 0 ? "+" : ""}
                        {getWeightChange()!.toFixed(1)} kg so với lần trước
                      </span>
                    ) : (
                      "Chưa có dữ liệu"
                    )}
                  </p>
                  {user && (
                    <Button
                      className="w-full mt-4 bg-primary hover:bg-primary/90"
                      onClick={() => setActiveTab("weight")}
                    >
                      Thêm cân nặng
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Calories Overview Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Apple className="w-5 h-5 text-accent" />
                    Calo hôm nay
                  </CardTitle>
                  <CardDescription>Carb • Protein • Fat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">
                    {getTodayCalories() > 0 ? `${getTodayCalories().toFixed(0)} kcal` : "-- kcal"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTodayCalories() > 0
                      ? `${todayMacros.carbs}g carb • ${todayMacros.protein}g protein • ${todayMacros.fat}g fat`
                      : "Chưa có dữ liệu"}
                  </p>
                  {user && (
                    <Button
                      variant="secondary"
                      className="w-full mt-4 bg-accent hover:bg-accent/90"
                      onClick={() => setActiveTab("calories")}
                    >
                      Thêm bữa ăn
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* BMR Calculator Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Target className="w-5 h-5 text-chart-3" />
                    Calo cần thiết
                  </CardTitle>
                  <CardDescription>Dựa trên thông tin cá nhân</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-3 mb-2">
                    {calorieResults ? `${calorieResults.tdee} kcal` : "-- kcal"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {calorieResults ? `BMR: ${calorieResults.bmr} kcal` : "Chưa tính toán"}
                  </p>
                  {user && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                      onClick={() => setActiveTab("calculator")}
                    >
                      Tính toán BMR
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Hành động nhanh</CardTitle>
                <CardDescription>Các tính năng chính của ứng dụng theo dõi sức khỏe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {user && (
                    <Button
                      onClick={() => setActiveTab("weight")}
                      className="h-20 flex-col gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Scale className="w-6 h-6" />
                      <span>Theo dõi cân nặng</span>
                    </Button>
                  )}
                  {user && (
                    <Button
                      onClick={() => setActiveTab("calories")}
                      variant="secondary"
                      className="h-20 flex-col gap-2 bg-accent hover:bg-accent/90"
                    >
                      <Apple className="w-6 h-6" />
                      <span>Ghi nhận calo</span>
                    </Button>
                  )}
                  {user && (
                    <Button
                      onClick={() => setActiveTab("calculator")}
                      variant="outline"
                      className="h-20 flex-col gap-2"
                    >
                      <Calculator className="w-6 h-6" />
                      <span>Tính calo cần thiết</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-6">
            {/* Add Weight Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Plus className="w-5 h-5 text-primary" />
                  Thêm cân nặng mới
                </CardTitle>
                <CardDescription>Ghi lại cân nặng hôm nay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Cân nặng (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="65.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                    <Input
                      id="note"
                      placeholder="Sau khi tập gym..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                {user && (
                  <Button
                    onClick={addWeightEntry}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!newWeight || isNaN(Number(newWeight))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cân nặng
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Weight Chart */}
            {weightEntries.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Biểu đồ cân nặng</CardTitle>
                  <CardDescription>Xu hướng thay đổi cân nặng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                        <YAxis
                          className="text-muted-foreground"
                          fontSize={12}
                          domain={["dataMin - 2", "dataMax + 2"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--card-foreground))",
                          }}
                          formatter={(value: number) => [`${value} kg`, "Cân nặng"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weight History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Lịch sử cân nặng</CardTitle>
                <CardDescription>
                  {weightEntries.length > 0 ? `${weightEntries.length} lần đo cân nặng` : "Chưa có dữ liệu cân nặng"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weightEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Chưa có dữ liệu cân nặng</p>
                    <p className="text-sm text-muted-foreground">Thêm cân nặng đầu tiên để bắt đầu theo dõi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weightEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-primary">{entry.weight} kg</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString("vi-VN", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                          </div>
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWeightEntry(entry.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calories Tab */}
          <TabsContent value="calories" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Search className="w-5 h-5 text-accent" />
                  Phân tích thực phẩm
                </CardTitle>
                <CardDescription>Tra cứu thông tin dinh dưỡng của thực phẩm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="foodName">Tên thực phẩm</Label>
                    <Input
                      id="foodName"
                      placeholder="Ví dụ: cơm trắng, thịt gà..."
                      value={foodAnalyzer.foodName}
                      onChange={(e) => setFoodAnalyzer((prev) => ({ ...prev, foodName: e.target.value }))}
                      className="bg-input border-border"
                    />
                    {/* Food suggestions */}
                    {foodAnalyzer.foodName && (
                      <div className="space-y-1">
                        {searchFood(foodAnalyzer.foodName).map((food) => (
                          <button
                            key={food}
                            onClick={() => setFoodAnalyzer((prev) => ({ ...prev, foodName: food }))}
                            className="block w-full text-left px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md"
                          >
                            {food}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foodWeight">Khối lượng (gram)</Label>
                    <Input
                      id="foodWeight"
                      type="number"
                      placeholder="100"
                      value={foodAnalyzer.weight}
                      onChange={(e) => setFoodAnalyzer((prev) => ({ ...prev, weight: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <Button
                  onClick={analyzeFood}
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={!foodAnalyzer.foodName || !foodAnalyzer.weight}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Phân tích thực phẩm
                </Button>

                {/* Analysis Results */}
                {foodAnalyzer.results && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Kết quả phân tích: {foodAnalyzer.results.foodName} ({foodAnalyzer.results.weight}g)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{foodAnalyzer.results.calories.toFixed(0)}</p>
                        <p className="text-sm text-muted-foreground">Calo</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-chart-1">{foodAnalyzer.results.carbs.toFixed(1)}g</p>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-chart-2">{foodAnalyzer.results.protein.toFixed(1)}g</p>
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-chart-3">{foodAnalyzer.results.fat.toFixed(1)}g</p>
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                    </div>
                    {user && (
                      <Button onClick={addAnalyzedFood} className="w-full bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm vào bữa ăn
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Meal Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Plus className="w-5 h-5 text-accent" />
                  Thêm bữa ăn mới
                </CardTitle>
                <CardDescription>Ghi lại thông tin dinh dưỡng của bữa ăn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mealName">Tên bữa ăn</Label>
                    <Input
                      id="mealName"
                      placeholder="Bữa sáng, Bữa trưa..."
                      value={newMealName}
                      onChange={(e) => setNewMealName(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calorieNote">Ghi chú (tùy chọn)</Label>
                    <Input
                      id="calorieNote"
                      placeholder="Cơm gà, salad..."
                      value={newCalorieNote}
                      onChange={(e) => setNewCalorieNote(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      placeholder="50"
                      value={newCarbs}
                      onChange={(e) => setNewCarbs(e.target.value)}
                      className="bg-input border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      {newCarbs && !isNaN(Number(newCarbs)) ? `${(Number(newCarbs) * 4).toFixed(0)} kcal` : "0 kcal"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      placeholder="25"
                      value={newProtein}
                      onChange={(e) => setNewProtein(e.target.value)}
                      className="bg-input border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      {newProtein && !isNaN(Number(newProtein))
                        ? `${(Number(newProtein) * 4).toFixed(0)} kcal`
                        : "0 kcal"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      placeholder="15"
                      value={newFat}
                      onChange={(e) => setNewFat(e.target.value)}
                      className="bg-input border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      {newFat && !isNaN(Number(newFat)) ? `${(Number(newFat) * 9).toFixed(0)} kcal` : "0 kcal"}
                    </p>
                  </div>
                </div>

                {/* Total Calories Preview */}
                {(newCarbs || newProtein || newFat) && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Tổng calo:{" "}
                      <span className="text-accent font-bold">
                        {(
                          (Number(newCarbs) || 0) * 4 +
                          (Number(newProtein) || 0) * 4 +
                          (Number(newFat) || 0) * 9
                        ).toFixed(0)}{" "}
                        kcal
                      </span>
                    </p>
                  </div>
                )}

                {user && (
                  <Button
                    onClick={addCalorieEntry}
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={!newMealName.trim() || !newCarbs || !newProtein || !newFat}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bữa ăn
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Today's Nutrition Overview */}
            {getTodayCalories() > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Pie Chart */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Phân bổ calo hôm nay</CardTitle>
                    <CardDescription>Tỷ lệ các chất dinh dưỡng</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [`${value.toFixed(0)} kcal`, name]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--card-foreground))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                        <span className="text-sm text-muted-foreground">Carbs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                        <span className="text-sm text-muted-foreground">Protein</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                        <span className="text-sm text-muted-foreground">Fat</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Chi tiết dinh dưỡng</CardTitle>
                    <CardDescription>Gram và calo theo từng chất</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={macroBarData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
                          <YAxis className="text-muted-foreground" fontSize={12} />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              name === "grams" ? `${value}g` : `${value} kcal`,
                              name === "grams" ? "Gram" : "Calo",
                            ]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--card-foreground))",
                            }}
                          />
                          <Bar dataKey="calories" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Meal History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Lịch sử bữa ăn</CardTitle>
                <CardDescription>
                  {calorieEntries.length > 0 ? `${calorieEntries.length} bữa ăn đã ghi nhận` : "Chưa có dữ liệu bữa ăn"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calorieEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Chưa có dữ liệu bữa ăn</p>
                    <p className="text-sm text-muted-foreground">Thêm bữa ăn đầu tiên để bắt đầu theo dõi</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calorieEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-accent">{entry.mealName}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString("vi-VN", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{entry.totalCalories.toFixed(0)} kcal</span>
                              <span>C: {entry.carbs}g</span>
                              <span>P: {entry.protein}g</span>
                              <span>F: {entry.fat}g</span>
                            </div>
                            {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                          </div>
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCalorieEntry(entry.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            {/* Personal Information Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="w-5 h-5 text-chart-3" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>Nhập thông tin để tính toán BMR và TDEE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Tuổi</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={personalInfo.age || ""}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, age: Number(e.target.value) }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value: "male" | "female") =>
                        setPersonalInfo((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="calcWeight">Cân nặng (kg)</Label>
                    <Input
                      id="calcWeight"
                      type="number"
                      step="0.1"
                      placeholder="65.5"
                      value={personalInfo.weight || ""}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Chiều cao (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={personalInfo.height || ""}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, height: Number(e.target.value) }))}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Mức độ vận động</Label>
                  <Select
                    value={personalInfo.activityLevel}
                    onValueChange={(value) => setPersonalInfo((prev) => ({ ...prev, activityLevel: value }))}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Chọn mức độ vận động" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Ít vận động (công việc văn phòng, không tập thể dục)</SelectItem>
                      <SelectItem value="light">Vận động nhẹ (tập thể dục nhẹ 1-3 ngày/tuần)</SelectItem>
                      <SelectItem value="moderate">Vận động vừa (tập thể dục vừa 3-5 ngày/tuần)</SelectItem>
                      <SelectItem value="active">Vận động nhiều (tập thể dục nặng 6-7 ngày/tuần)</SelectItem>
                      <SelectItem value="very-active">
                        Rất năng động (tập thể dục rất nặng, công việc thể chất)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user && (
                  <Button
                    onClick={calculateCalories}
                    className="w-full bg-chart-3 hover:bg-chart-3/90 text-white"
                    disabled={
                      !personalInfo.age || !personalInfo.weight || !personalInfo.height || !personalInfo.activityLevel
                    }
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Tính toán calo cần thiết
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {calorieResults && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* BMR Card */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Zap className="w-5 h-5 text-primary" />
                      BMR
                    </CardTitle>
                    <CardDescription>Tỷ lệ trao đổi chất cơ bản</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">{calorieResults.bmr} kcal</div>
                    <p className="text-xs text-muted-foreground">Calo cần để duy trì các chức năng cơ bản</p>
                  </CardContent>
                </Card>

                {/* TDEE Card */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Target className="w-5 h-5 text-chart-3" />
                      TDEE
                    </CardTitle>
                    <CardDescription>Tổng năng lượng tiêu thụ hàng ngày</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3 mb-2">{calorieResults.tdee} kcal</div>
                    <p className="text-xs text-muted-foreground">Calo cần để duy trì cân nặng hiện tại</p>
                  </CardContent>
                </Card>

                {/* Weight Loss Card */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Giảm cân
                    </CardTitle>
                    <CardDescription>Mục tiêu giảm 0.5kg/tuần</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500 mb-2">{calorieResults.weightLoss} kcal</div>
                    <p className="text-xs text-muted-foreground">Deficit 500 kcal/ngày</p>
                  </CardContent>
                </Card>

                {/* Weight Gain Card */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Tăng cân
                    </CardTitle>
                    <CardDescription>Mục tiêu tăng 0.5kg/tuần</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500 mb-2">{calorieResults.weightGain} kcal</div>
                    <p className="text-xs text-muted-foreground">Surplus 500 kcal/ngày</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Information Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Thông tin về BMR và TDEE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">BMR (Basal Metabolic Rate)</h4>
                  <p className="text-sm text-muted-foreground">
                    Là lượng calo cơ thể cần để duy trì các chức năng cơ bản như hô hấp, tuần hoàn máu, sản xuất tế bào
                    khi nghỉ ngơi hoàn toàn.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">TDEE (Total Daily Energy Expenditure)</h4>
                  <p className="text-sm text-muted-foreground">
                    Là tổng lượng calo bạn đốt cháy trong một ngày, bao gồm BMR cộng với calo đốt cháy từ hoạt động thể
                    chất và tiêu hóa thức ăn.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Cách sử dụng</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <strong>Duy trì cân nặng:</strong> Ăn đúng bằng TDEE
                    </li>
                    <li>
                      • <strong>Giảm cân:</strong> Ăn ít hơn TDEE (thường là 300-500 kcal)
                    </li>
                    <li>
                      • <strong>Tăng cân:</strong> Ăn nhiều hơn TDEE (thường là 300-500 kcal)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisor" className="space-y-6">
            {/* Personal Information Form */}
            {user && !calorieResults && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <User className="w-5 h-5 text-blue-500" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>Nhập thông tin để tính toán chính xác</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="height">Chiều cao (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        value={personalInfo.height}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, height: e.target.value }))}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Tuổi</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={personalInfo.age}
                        onChange={(e) => setPersonalInfo((prev) => ({ ...prev, age: e.target.value }))}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Giới tính</Label>
                      <Select
                        value={personalInfo.gender}
                        onValueChange={(value: "male" | "female") =>
                          setPersonalInfo((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mức độ vận động</Label>
                      <Select
                        value={personalInfo.activityLevel}
                        onValueChange={(value: any) => setPersonalInfo((prev) => ({ ...prev, activityLevel: value }))}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Ít vận động (văn phòng)</SelectItem>
                          <SelectItem value="light">Vận động nhẹ (1-3 ngày/tuần)</SelectItem>
                          <SelectItem value="moderate">Vận động vừa (3-5 ngày/tuần)</SelectItem>
                          <SelectItem value="active">Vận động nhiều (6-7 ngày/tuần)</SelectItem>
                          <SelectItem value="very_active">Vận động rất nhiều (2 lần/ngày)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      // This would normally calculate BMR/TDEE based on personal info
                      // For now, redirect to calculator tab
                      setActiveTab("calculator")
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={!personalInfo.height || !personalInfo.age}
                  >
                    Tính toán calo cần thiết
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Weight Goal Roadmap */}
            {user && calorieResults && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Lộ trình cân nặng chi tiết
                  </CardTitle>
                  <CardDescription>Kế hoạch từng ngày để đạt mục tiêu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!weightGoal ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="goalCurrentWeight">Cân nặng hiện tại (kg)</Label>
                          <Input
                            id="goalCurrentWeight"
                            type="number"
                            step="0.1"
                            placeholder="65.0"
                            value={goalCurrentWeight}
                            onChange={(e) => setGoalCurrentWeight(e.target.value)}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goalTargetWeight">Cân nặng mục tiêu (kg)</Label>
                          <Input
                            id="goalTargetWeight"
                            type="number"
                            step="0.1"
                            placeholder="60.0"
                            value={goalTargetWeight}
                            onChange={(e) => setGoalTargetWeight(e.target.value)}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="goalTimeframe">Thời gian (tuần)</Label>
                          <Input
                            id="goalTimeframe"
                            type="number"
                            placeholder="12"
                            value={goalTimeframe}
                            onChange={(e) => setGoalTimeframe(e.target.value)}
                            className="bg-input border-border"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goalType">Mục tiêu</Label>
                        <Select
                          value={goalType}
                          onValueChange={(value: "lose" | "gain" | "maintain") => setGoalType(value)}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Chọn mục tiêu" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lose">Giảm cân</SelectItem>
                            <SelectItem value="gain">Tăng cân</SelectItem>
                            <SelectItem value="maintain">Duy trì cân nặng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={createWeightGoal}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={!goalCurrentWeight || !goalTargetWeight || !goalTimeframe}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Tạo lộ trình chi tiết
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Goal Overview */}
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold text-foreground mb-1">Hiện tại</h4>
                          <p className="text-2xl font-bold text-primary">{weightGoal.currentWeight} kg</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold text-foreground mb-1">Mục tiêu</h4>
                          <p className="text-2xl font-bold text-green-500">{weightGoal.targetWeight} kg</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold text-foreground mb-1">
                            Cần {weightGoal.goalType === "lose" ? "giảm" : "tăng"}
                          </h4>
                          <p className="text-2xl font-bold text-accent">
                            {Math.abs(weightGoal.targetWeight - weightGoal.currentWeight).toFixed(1)} kg
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold text-foreground mb-1">Thời gian</h4>
                          <p className="text-2xl font-bold text-chart-3">{weightGoal.timeframe} tuần</p>
                        </div>
                      </div>

                      {/* Roadmap Details */}
                      {(() => {
                        const roadmap = generateRoadmap(weightGoal)
                        if (!roadmap) return null

                        return (
                          <div className="space-y-6">
                            {/* Daily Targets */}
                            <Card className="bg-muted border-border">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <Target className="w-5 h-5 text-accent" />
                                  Mục tiêu hàng ngày
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Calo mục tiêu</h4>
                                    <p className="text-2xl font-bold text-accent">{roadmap.targetCalories} kcal</p>
                                    <p className="text-sm text-muted-foreground">
                                      {weightGoal.weeklyTarget.toFixed(1)} kg/tuần
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-2">Phân bổ macro</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Protein:</span>
                                        <span className="font-medium">{roadmap.macroSuggestions.protein}g (25%)</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Carbs:</span>
                                        <span className="font-medium">{roadmap.macroSuggestions.carbs}g (45%)</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Fat:</span>
                                        <span className="font-medium">{roadmap.macroSuggestions.fat}g (30%)</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-muted border-border">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <Utensils className="w-5 h-5 text-orange-500" />
                                  Thực đơn gợi ý hàng ngày
                                </CardTitle>
                                <CardDescription>
                                  Các bữa ăn phù hợp với mục tiêu {roadmap.targetCalories} kcal/ngày
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {(() => {
                                  const mealPlan = generateMealPlan(roadmap, weightGoal.goalType)
                                  return (
                                    <div className="grid gap-6 md:grid-cols-2">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-yellow-500" />
                                            Bữa sáng (250-300 kcal)
                                          </h4>
                                          <div className="space-y-2">
                                            {mealPlan.breakfast.map((meal, index) => (
                                              <div key={index} className="p-3 bg-background rounded-lg text-sm">
                                                {meal}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-orange-500" />
                                            Bữa trưa (400-500 kcal)
                                          </h4>
                                          <div className="space-y-2">
                                            {mealPlan.lunch.map((meal, index) => (
                                              <div key={index} className="p-3 bg-background rounded-lg text-sm">
                                                {meal}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Moon className="w-4 h-4 text-blue-500" />
                                            Bữa tối (300-400 kcal)
                                          </h4>
                                          <div className="space-y-2">
                                            {mealPlan.dinner.map((meal, index) => (
                                              <div key={index} className="p-3 bg-background rounded-lg text-sm">
                                                {meal}
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-green-500" />
                                            Snacks (80-150 kcal)
                                          </h4>
                                          <div className="space-y-2">
                                            {mealPlan.snacks.map((snack, index) => (
                                              <div key={index} className="p-3 bg-background rounded-lg text-sm">
                                                {snack}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </CardContent>
                            </Card>

                            <Card className="bg-muted border-border">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                                  Lời khuyên dinh dưỡng
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                  {weightGoal.goalType === "lose" ? (
                                    <>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">💧 Uống đủ nước</h4>
                                        <p className="text-sm text-muted-foreground">
                                          2-3 lít nước/ngày. Uống 1 cốc nước trước mỗi bữa ăn để tăng cảm giác no.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">🥗 Ăn nhiều rau xanh</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Rau xanh ít calo, nhiều chất xơ giúp no lâu và cung cấp vitamin.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">⏰ Ăn đúng giờ</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Chia nhỏ thành 5-6 bữa/ngày, tránh bỏ bữa để duy trì trao đổi chất.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">🚫 Tránh đồ ngọt</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Hạn chế đường, nước ngọt, bánh kẹo. Thay bằng trái cây tự nhiên.
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">🥜 Tăng calo lành mạnh</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Thêm hạt, bơ, dầu ô liu, sữa chua để tăng calo một cách lành mạnh.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">🥩 Protein chất lượng</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Ăn đủ protein từ thịt, cá, trứng, đậu để xây dựng cơ bắp.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">🍌 Carb phức hợp</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Chọn gạo lứt, yến mạch, khoai lang thay vì carb đơn giản.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">⚡ Ăn sau tập</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Ăn protein + carb trong 30 phút sau tập để phục hồi cơ bắp.
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Weekly Milestones */}
                            <Card className="bg-muted border-border">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <Calendar className="w-5 h-5 text-primary" />
                                  Mốc theo tuần
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                  {roadmap.weeklyMilestones.map((milestone) => (
                                    <div key={milestone.week} className="p-3 bg-background rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-foreground">Tuần {milestone.week}</span>
                                        <span className="text-primary font-bold">
                                          {milestone.targetWeight.toFixed(1)} kg
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Exercise Recommendations */}
                            <Card className="bg-muted border-border">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-card-foreground">
                                  <Dumbbell className="w-5 h-5 text-chart-3" />
                                  Gợi ý tập luyện
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                  {weightGoal.goalType === "lose" ? (
                                    <>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Cardio</h4>
                                        <p className="text-sm text-muted-foreground">
                                          30-45 phút, 4-5 lần/tuần. Chạy bộ, đạp xe, bơi lội để đốt cháy calo hiệu quả.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Tập tạ</h4>
                                        <p className="text-sm text-muted-foreground">
                                          3 lần/tuần để duy trì khối lượng cơ trong quá trình giảm cân.
                                        </p>
                                      </div>
                                    </>
                                  ) : weightGoal.goalType === "gain" ? (
                                    <>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Tập tạ</h4>
                                        <p className="text-sm text-muted-foreground">
                                          4-5 lần/tuần, tập nặng để xây dựng khối lượng cơ và tăng cân khỏe mạnh.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Cardio nhẹ</h4>
                                        <p className="text-sm text-muted-foreground">
                                          2-3 lần/tuần, 20-30 phút để duy trì sức khỏe tim mạch.
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Cân bằng</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Kết hợp cardio và tập tạ 3-4 lần/tuần để duy trì cân nặng ổn định.
                                        </p>
                                      </div>
                                      <div className="p-4 bg-background rounded-lg">
                                        <h4 className="font-semibold text-foreground mb-2">Linh hoạt</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Yoga, stretching để cải thiện độ linh hoạt và giảm stress.
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Button onClick={() => setWeightGoal(null)} variant="outline" className="w-full">
                              Tạo lộ trình mới
                            </Button>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Overview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Phân tích AI
                </CardTitle>
                <CardDescription>Lời khuyên cá nhân hóa dựa trên dữ liệu của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Vui lòng đăng nhập để sử dụng AI Advisor</p>
                  </div>
                ) : weightEntries.length === 0 && calorieEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Chưa có đủ dữ liệu để phân tích</p>
                    <p className="text-sm text-muted-foreground">
                      Hãy thêm dữ liệu cân nặng và calo để nhận lời khuyên từ AI
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generateAdvice().map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          item.type === "success"
                            ? "bg-green-50 border-green-500 dark:bg-green-950"
                            : item.type === "warning"
                              ? "bg-yellow-50 border-yellow-500 dark:bg-yellow-950"
                              : item.type === "tip"
                                ? "bg-blue-50 border-blue-500 dark:bg-blue-950"
                                : "bg-gray-50 border-gray-500 dark:bg-gray-950"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <item.icon
                            className={`w-5 h-5 mt-0.5 ${
                              item.type === "success"
                                ? "text-green-600"
                                : item.type === "warning"
                                  ? "text-yellow-600"
                                  : item.type === "tip"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats for AI Analysis */}
            {user && (weightEntries.length > 0 || calorieEntries.length > 0) && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Weight Trend Card */}
                {weightEntries.length >= 3 && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Xu hướng cân nặng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getWeightTrend() === "increasing"
                              ? "destructive"
                              : getWeightTrend() === "decreasing"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {getWeightTrend() === "increasing"
                            ? "Đang tăng"
                            : getWeightTrend() === "decreasing"
                              ? "Đang giảm"
                              : "Ổn định"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Dựa trên 3 lần đo gần nhất</p>
                    </CardContent>
                  </Card>
                )}

                {/* Calorie Status Card */}
                {getCalorieAnalysis() && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Target className="w-5 h-5 text-accent" />
                        Trạng thái calo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant={getCalorieAnalysis()?.status === "good" ? "default" : "secondary"}>
                          {getCalorieAnalysis()?.status === "good"
                            ? "Phù hợp"
                            : getCalorieAnalysis()?.status === "high"
                              ? "Cao"
                              : "Thấp"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        TB 7 ngày: {getCalorieAnalysis()?.avgCalories} kcal
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Macro Balance Card */}
                {getMacroBalance() && (
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Utensils className="w-5 h-5 text-chart-3" />
                        Cân bằng dinh dưỡng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Carbs:</span>
                          <span>{getMacroBalance()?.carbs}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Protein:</span>
                          <span>{getMacroBalance()?.protein}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Fat:</span>
                          <span>{getMacroBalance()?.fat}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Nutrition Tips */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Mẹo dinh dưỡng
                </CardTitle>
                <CardDescription>Những lời khuyên hữu ích cho sức khỏe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Uống đủ nước</h4>
                    <p className="text-sm text-muted-foreground">
                      Uống ít nhất 8 ly nước mỗi ngày để duy trì sự hydrat hóa và hỗ trợ trao đổi chất.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Ăn nhiều rau xanh</h4>
                    <p className="text-sm text-muted-foreground">
                      Rau xanh cung cấp vitamin, khoáng chất và chất xơ cần thiết cho cơ thể.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Ăn đều các bữa</h4>
                    <p className="text-sm text-muted-foreground">
                      Chia nhỏ thành 5-6 bữa ăn nhỏ thay vì 3 bữa lớn để duy trì năng lượng ổn định.
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Ngủ đủ giấc</h4>
                    <p className="text-sm text-muted-foreground">
                      7-9 tiếng ngủ mỗi đêm giúp cơ thể phục hồi và duy trì hormone cân bằng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
