const chalk = require("chalk");

class DynamicColorCoding {
  static colors = [
    { code: "#E63946", desc: "Red" },
    { code: "#C70039", desc: "Dark Red" },
    { code: "#F77F00", desc: "Bright Orange" },
    { code: "#3A86FF", desc: "Vivid Blue" },
    { code: "#8338EC", desc: "Bright Purple" },
    { code: "#00FFCC", desc: "Turquoise" },
    { code: "#00FF00", desc: "Lime Green" },
    { code: "#C4E538", desc: "Yellow Green" },
    { code: "#FF006E", desc: "Bright Pink" },
    { code: "#FA8072", desc: "Salmon" },
    { code: "#FFA500", desc: "Orange" },
    { code: "#FFD700", desc: "Gold" },
    { code: "#FF69B4", desc: "Hot Pink" },
    { code: "#FF00FF", desc: "Magenta" },
    { code: "#FF0000", desc: "Red" },
  ];

  static generateColorIndex(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    let index = Math.abs(hash % this.colors.length);
    // console.log(`Generated hash: ${hash}, Index: ${index}`); // Debug log
    return index;
  }

  static getColorByInput(inputName) {
    if (!inputName) {
      console.warn("Received undefined or empty input for color generation.");
      return chalk.hex("#000000"); // Default to black or any other fallback color
    }
    const index = this.generateColorIndex(inputName);
    const color = this.colors[index];
    // console.log(`Name: ${inputName}, Color: ${color.desc} (${color.code})`);
    return chalk.hex(color.code);
  }

  static getDepartmentColor(departmentName) {
    return this.getColorByInput(departmentName);
  }

  static getRoleColor(roleName) {
    return this.getColorByInput(roleName);
  }

  static getColorByDepartmentName(departmentName) {
    return this.getDepartmentColor(departmentName);
  }
}

module.exports = DynamicColorCoding;