import json
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

def load_calorie_data():
    """Load calorie data from localStorage simulation"""
    # Sample calorie data for demonstration
    sample_data = [
        {"id": "1", "date": "2024-01-01", "mealName": "Bữa sáng", "carbs": 45, "protein": 20, "fat": 15, "totalCalories": 380},
        {"id": "2", "date": "2024-01-01", "mealName": "Bữa trưa", "carbs": 60, "protein": 35, "fat": 20, "totalCalories": 540},
        {"id": "3", "date": "2024-01-01", "mealName": "Bữa tối", "carbs": 50, "protein": 30, "fat": 18, "totalCalories": 482},
        {"id": "4", "date": "2024-01-02", "mealName": "Bữa sáng", "carbs": 40, "protein": 25, "fat": 12, "totalCalories": 368},
        {"id": "5", "date": "2024-01-02", "mealName": "Bữa trưa", "carbs": 55, "protein": 40, "fat": 22, "totalCalories": 558},
        {"id": "6", "date": "2024-01-02", "mealName": "Bữa tối", "carbs": 48, "protein": 28, "fat": 16, "totalCalories": 456},
        {"id": "7", "date": "2024-01-03", "mealName": "Bữa sáng", "carbs": 42, "protein": 22, "fat": 14, "totalCalories": 374},
        {"id": "8", "date": "2024-01-03", "mealName": "Bữa trưa", "carbs": 58, "protein": 32, "fat": 18, "totalCalories": 518},
    ]
    return sample_data

def analyze_daily_calories(calorie_data):
    """Analyze daily calorie intake and macronutrient distribution"""
    daily_totals = defaultdict(lambda: {"calories": 0, "carbs": 0, "protein": 0, "fat": 0, "meals": 0})
    
    for entry in calorie_data:
        date = entry["date"]
        daily_totals[date]["calories"] += entry["totalCalories"]
        daily_totals[date]["carbs"] += entry["carbs"]
        daily_totals[date]["protein"] += entry["protein"]
        daily_totals[date]["fat"] += entry["fat"]
        daily_totals[date]["meals"] += 1
    
    # Calculate statistics
    daily_calories = [day["calories"] for day in daily_totals.values()]
    daily_carbs = [day["carbs"] for day in daily_totals.values()]
    daily_protein = [day["protein"] for day in daily_totals.values()]
    daily_fat = [day["fat"] for day in daily_totals.values()]
    
    if not daily_calories:
        return {"error": "Không có dữ liệu calo để phân tích"}
    
    analysis = {
        "total_days": len(daily_totals),
        "avg_daily_calories": round(statistics.mean(daily_calories), 1),
        "avg_daily_carbs": round(statistics.mean(daily_carbs), 1),
        "avg_daily_protein": round(statistics.mean(daily_protein), 1),
        "avg_daily_fat": round(statistics.mean(daily_fat), 1),
        "max_daily_calories": max(daily_calories),
        "min_daily_calories": min(daily_calories),
        "calorie_std": round(statistics.stdev(daily_calories) if len(daily_calories) > 1 else 0, 1),
        "avg_meals_per_day": round(statistics.mean([day["meals"] for day in daily_totals.values()]), 1),
        "daily_data": dict(daily_totals)
    }
    
    # Calculate macro percentages
    total_carb_calories = analysis["avg_daily_carbs"] * 4
    total_protein_calories = analysis["avg_daily_protein"] * 4
    total_fat_calories = analysis["avg_daily_fat"] * 9
    total_macro_calories = total_carb_calories + total_protein_calories + total_fat_calories
    
    if total_macro_calories > 0:
        analysis["carb_percentage"] = round((total_carb_calories / total_macro_calories) * 100, 1)
        analysis["protein_percentage"] = round((total_protein_calories / total_macro_calories) * 100, 1)
        analysis["fat_percentage"] = round((total_fat_calories / total_macro_calories) * 100, 1)
    
    return analysis

def create_calorie_charts(calorie_data):
    """Create comprehensive calorie and macro analysis charts"""
    analysis = analyze_daily_calories(calorie_data)
    
    if "error" in analysis:
        print(analysis["error"])
        return
    
    # Create figure with multiple subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. Daily calorie intake
    dates = list(analysis["daily_data"].keys())
    daily_calories = [analysis["daily_data"][date]["calories"] for date in dates]
    
    ax1.bar(dates, daily_calories, color='#0891b2', alpha=0.7)
    ax1.axhline(y=analysis["avg_daily_calories"], color='#f97316', linestyle='--', 
                label=f'Trung bình: {analysis["avg_daily_calories"]} kcal')
    ax1.set_title('Lượng Calo Hàng Ngày', fontsize=14, fontweight='bold')
    ax1.set_ylabel('Calo (kcal)')
    ax1.legend()
    ax1.tick_params(axis='x', rotation=45)
    
    # 2. Macro distribution pie chart
    macro_data = [analysis["avg_daily_carbs"] * 4, analysis["avg_daily_protein"] * 4, analysis["avg_daily_fat"] * 9]
    macro_labels = ['Carbs', 'Protein', 'Fat']
    colors = ['#0891b2', '#f97316', '#d97706']
    
    ax2.pie(macro_data, labels=macro_labels, colors=colors, autopct='%1.1f%%', startangle=90)
    ax2.set_title('Phân Bổ Macro Trung Bình', fontsize=14, fontweight='bold')
    
    # 3. Daily macro intake
    daily_carbs = [analysis["daily_data"][date]["carbs"] for date in dates]
    daily_protein = [analysis["daily_data"][date]["protein"] for date in dates]
    daily_fat = [analysis["daily_data"][date]["fat"] for date in dates]
    
    x = np.arange(len(dates))
    width = 0.25
    
    ax3.bar(x - width, daily_carbs, width, label='Carbs (g)', color='#0891b2', alpha=0.7)
    ax3.bar(x, daily_protein, width, label='Protein (g)', color='#f97316', alpha=0.7)
    ax3.bar(x + width, daily_fat, width, label='Fat (g)', color='#d97706', alpha=0.7)
    
    ax3.set_title('Lượng Macro Hàng Ngày', fontsize=14, fontweight='bold')
    ax3.set_ylabel('Gram')
    ax3.set_xticks(x)
    ax3.set_xticklabels(dates, rotation=45)
    ax3.legend()
    
    # 4. Calorie trend
    if len(daily_calories) > 1:
        ax4.plot(dates, daily_calories, 'o-', color='#0891b2', linewidth=2, markersize=6)
        
        # Add trend line
        x_numeric = np.arange(len(dates))
        slope, intercept = np.polyfit(x_numeric, daily_calories, 1)
        trend_line = [slope * x + intercept for x in x_numeric]
        ax4.plot(dates, trend_line, '--', color='#f97316', alpha=0.7, label='Xu hướng')
        
        ax4.set_title('Xu Hướng Calo Theo Thời Gian', fontsize=14, fontweight='bold')
        ax4.set_ylabel('Calo (kcal)')
        ax4.tick_params(axis='x', rotation=45)
        ax4.legend()
    
    plt.tight_layout()
    plt.show()
    
    return fig

def generate_calorie_report(calorie_data):
    """Generate comprehensive calorie analysis report"""
    analysis = analyze_daily_calories(calorie_data)
    
    if "error" in analysis:
        return analysis["error"]
    
    report = f"""
=== BÁO CÁO PHÂN TÍCH CALO VÀ DINH DƯỠNG ===

📊 THỐNG KÊ TỔNG QUAN:
• Số ngày theo dõi: {analysis['total_days']} ngày
• Calo trung bình/ngày: {analysis['avg_daily_calories']} kcal
• Số bữa ăn trung bình/ngày: {analysis['avg_meals_per_day']} bữa
• Độ biến động calo: ±{analysis['calorie_std']} kcal

📈 PHÂN BỔ MACRO TRUNG BÌNH:
• Carbs: {analysis['avg_daily_carbs']}g ({analysis.get('carb_percentage', 0)}% tổng calo)
• Protein: {analysis['avg_daily_protein']}g ({analysis.get('protein_percentage', 0)}% tổng calo)  
• Fat: {analysis['avg_daily_fat']}g ({analysis.get('fat_percentage', 0)}% tổng calo)

📊 KHOẢNG CALO:
• Cao nhất: {analysis['max_daily_calories']} kcal
• Thấp nhất: {analysis['min_daily_calories']} kcal
• Chênh lệch: {analysis['max_daily_calories'] - analysis['min_daily_calories']} kcal

💡 ĐÁNH GIÁ DINH DƯỠNG:
"""
    
    # Add nutritional insights
    carb_pct = analysis.get('carb_percentage', 0)
    protein_pct = analysis.get('protein_percentage', 0)
    fat_pct = analysis.get('fat_percentage', 0)
    
    if carb_pct > 60:
        report += "• Tỷ lệ carbs cao (>60%). Cân nhắc giảm carbs, tăng protein.\n"
    elif carb_pct < 40:
        report += "• Tỷ lệ carbs thấp (<40%). Có thể cần thêm carbs cho năng lượng.\n"
    else:
        report += "• Tỷ lệ carbs hợp lý (40-60%).\n"
    
    if protein_pct < 15:
        report += "• Protein thấp (<15%). Nên tăng protein để duy trì cơ bắp.\n"
    elif protein_pct > 30:
        report += "• Protein cao (>30%). Đảm bảo cân bằng với các macro khác.\n"
    else:
        report += "• Tỷ lệ protein tốt (15-30%).\n"
    
    if fat_pct < 20:
        report += "• Fat thấp (<20%). Cần fat để hấp thụ vitamin và hormone.\n"
    elif fat_pct > 35:
        report += "• Fat cao (>35%). Cân nhắc giảm fat để kiểm soát calo.\n"
    else:
        report += "• Tỷ lệ fat hợp lý (20-35%).\n"
    
    if analysis['calorie_std'] > 300:
        report += "• Calo biến động nhiều. Hãy ăn đều đặn hơn.\n"
    else:
        report += "• Lượng calo ổn định, thói quen ăn tốt.\n"
    
    return report

# Main execution
if __name__ == "__main__":
    print("🍎 PHÂN TÍCH DỮ LIỆU CALO VÀ DINH DƯỠNG")
    print("=" * 50)
    
    # Load and analyze data
    calorie_data = load_calorie_data()
    print(f"Đã tải {len(calorie_data)} bữa ăn")
    
    # Generate analysis
    analysis = analyze_daily_calories(calorie_data)
    if "error" not in analysis:
        print(f"\n📊 Phân tích {analysis['total_days']} ngày dữ liệu")
        print(f"• Calo trung bình: {analysis['avg_daily_calories']} kcal/ngày")
        print(f"• Macro: {analysis['avg_daily_carbs']}g carbs, {analysis['avg_daily_protein']}g protein, {analysis['avg_daily_fat']}g fat")
    
    # Generate report
    report = generate_calorie_report(calorie_data)
    print(report)
    
    # Create visualization
    print("\n📈 Đang tạo biểu đồ...")
    create_calorie_charts(calorie_data)
    
    print("\n✅ Hoàn thành phân tích dữ liệu calo!")
