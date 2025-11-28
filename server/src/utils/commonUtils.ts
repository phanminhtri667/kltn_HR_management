class Util {
  public static generateId = () => {

  }

  public static  capitalizeFirstLetter = (input: string): string => {
    return input
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
}

export default Util