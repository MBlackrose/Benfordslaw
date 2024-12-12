from benfordslaw import benfordslaw
import numpy as np

# Gegebene Liste von Zahlen
#NO FRAUD
liste1 =[656.26, 502.29, 359.08, 438.95, 183.36, 575.63, 529.35, 307.99, 292.26, 615.49, 686.28, 235.93, 247.99, 380.96, 865.74, 450.8, 222.9, 787.69, 967.42, 575.67]
#FRAUD
liste2 = [
    82.45, 46.91, 87.32, 74.56, 13.67, 25.89, 37.21, 51.74, 61.43, 31.57, 19.85, 93.42, 71.28, 20.64, 57.39, 56.78, 36.12, 30.87, 49.53, 25.14,73.68, 35.91, 86.24, 91.75, 56.43, 16.89, 12.34, 82.56, 35.18, 18.72,98.31, 67.48, 93.69, 31.84, 29.16, 69.47, 60.92, 64.38, 74.29, 77.15,86.71, 14.82, 41.63, 20.45, 20.89, 13.57, 93.41, 52.78, 75.19, 14.36,299.74, 918.62, 296.47, 802.19, 506.92, 466.34, 884.75, 673.41, 103.58, 574.82,209.37, 267.49, 574.63, 836.72, 467.91, 154.38, 586.29, 626.74, 548.31, 288.56,187.62, 649.43, 394.17, 475.39, 948.25, 700.86, 937.47, 215.68, 439.57, 288.93,200.45, 977.83, 901.62, 554.21, 976.34, 107.48, 698.92, 928.74, 289.63, 375.18,938.27, 620.89, 880.35, 554.72, 575.46, 813.91, 338.12, 369.84, 213.74, 772.56
]
    

def checkFraud(liste):
    # Benfordslaw initialisieren
    bl = benfordslaw(alpha=0.05, method='chi2')
    # Zahlen analysieren
    results = bl.fit(np.array(liste))

    # Konvertiere percentage_emp in ein Dictionary mit Float-Werten
    #percentage_array = results['percentage_emp']
    #percentage_dict = {int(row[0]): float(row[1]) for row in percentage_array}

    # Ergebnisse anzeigen
    print(results)
    #print(percentage_dict)
    # Überprüfen, ob P-Wert signifikant ist (Anomalie / Betrug)
    if results['P'] < bl.alpha:
        return True 
    else:
        return False

print(checkFraud(liste=liste1))
print(checkFraud(liste=liste2))