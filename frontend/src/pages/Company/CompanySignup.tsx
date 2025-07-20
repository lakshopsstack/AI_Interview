import React, { useState } from "react";
import CompanyDocumentUpload from "@/components/company/CompanyDocumentUpload";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";
import RegularLayout from "@/components/layout/RegularLayout";
import { CommandList } from "cmdk";
import { companyApi } from "@/services/companyApi";

interface Country {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");

  const [countryPopupOpen, setCountryPopupOpen] = useState(false);
  const [statePopupOpen, setStatePopupOpen] = useState(false);
  const [cityPopupOpen, setCityPopupOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zip, setZip] = useState("");
  const [address, setAddress] = useState("");
// Document upload state
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");

  // Form state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength indicators
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  const passwordStrengthScore =
    Object.values(passwordStrength).filter(Boolean).length;

  const getPasswordStrengthLabel = () => {
    if (passwordStrengthScore === 0) return "";
    if (passwordStrengthScore <= 2) return "Weak";
    if (passwordStrengthScore <= 4) return "Medium";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrengthScore === 0) return "bg-muted";
    if (passwordStrengthScore <= 2) return "bg-destructive";
    if (passwordStrengthScore <= 4) return "bg-yellow-500";
    return "bg-success";
  };

  const fetchCountries = async (keyword?: string) => {
    try {
      const url = new URL(import.meta.env.VITE_API_BASE_URL + "/country");
      if (keyword) url.searchParams.append("keyword", keyword);
      const response = await fetch(url.toString());
      const data = await response.json();
      const countriesArray = data || [];
      setCountries(countriesArray);
    } catch (error: any) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to fetch countries");
      setCountries([]);
    }
  };

  const fetchStates = async (countryId: number, keyword?: string) => {
    try {
      const url = new URL(import.meta.env.VITE_API_BASE_URL + "/state");
      url.searchParams.append("country_id", countryId.toString());
      if (keyword) url.searchParams.append("keyword", keyword);
      const response = await fetch(url.toString());
      const data = await response.json();
      const statesArray = data || [];
      setStates(statesArray);
    } catch (error: any) {
      console.error("Error fetching states:", error);
      toast.error("Failed to fetch states");
      setStates([]);
    }
  };

  const fetchCities = async (
    countryId: number,
    stateId: number,
    keyword?: string
  ) => {
    try {
      const url = new URL(import.meta.env.VITE_API_BASE_URL + "/city");
      url.searchParams.append("country_id", countryId.toString());
      url.searchParams.append("state_id", stateId.toString());
      if (keyword) url.searchParams.append("keyword", keyword);
      const response = await fetch(url.toString());
      const data = await response.json();
      const citiesArray = data || [];
      setCities(citiesArray);
    } catch (error: any) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to fetch cities");
      setCities([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !industry.trim() ||
      !phone.trim() ||
      !selectedCountry?.name.trim() ||
      !selectedState?.name.trim() ||
      !selectedCity?.name.trim() ||
      !zip.trim() ||
      !address.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // if (passwordStrengthScore < 3) {
    //   toast.error("Please use a stronger password");
    //   return;
    // }

    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    if (!documentFile || !documentType) {
      toast.error("Please upload a company document and select its type.");
      return;
    }


    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("industry", industry);
      formData.append("country", selectedCountry.name);
      formData.append("state", selectedState.name);
      formData.append("city", selectedCity.name);
      formData.append("zip", zip);
      formData.append("address", address);
      formData.append("document_type", documentType);
      formData.append("document", documentFile);

      await companyApi.register(formData);
      toast.success("Account created successfully");
      navigate("/employer/login");
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (
          error.response?.data?.detail?.includes(
            'duplicate key value violates unique constraint "ix_recruiters_email"'
          )
        ) {
          toast.error(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          toast.error(
            error.response?.data?.detail ||
              "Invalid input. Please check your details and try again."
          );
        }
      } else {
        toast.error("Failed to create account. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <RegularLayout>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Company Signup</h1>
        <p className="text-center text-muted-foreground mb-6">
          Start hiring smarter with EdudiagnoAI – streamline your recruitment process, assess candidates efficiently, and build your dream team faster.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* Basic Information */}
            <div className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, "");
                    setPhone(value);
                  }}
                  pattern="[0-9]*"
                  placeholder="1234567890"
                  autoComplete="tel"
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Address Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Popover
                  open={countryPopupOpen}
                  onOpenChange={setCountryPopupOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedCountry && "text-muted-foreground"
                      )}
                    >
                      {selectedCountry?.name || "Select a country"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search country..."
                        onValueChange={(value) => fetchCountries(value)}
                      />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.id}
                              value={country.name}
                              onSelect={() => {
                                setSelectedCountry(country);
                                setCountryPopupOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCountry?.id === country.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Popover
                  open={statePopupOpen}
                  onOpenChange={setStatePopupOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedState && "text-muted-foreground"
                      )}
                      disabled={!selectedCountry}
                    >
                      {selectedState?.name || "Select a state"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search state..."
                        onValueChange={(value) =>
                          selectedCountry &&
                          fetchStates(selectedCountry.id, value)
                        }
                      />
                      <CommandList>
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {states.map((state) => (
                            <CommandItem
                              key={state.id}
                              value={state.name}
                              onSelect={() => {
                                setSelectedState(state);
                                setStatePopupOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedState?.id === state.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {state.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Popover open={cityPopupOpen} onOpenChange={setCityPopupOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedCity && "text-muted-foreground"
                      )}
                      disabled={!selectedState}
                    >
                      {selectedCity?.name || "Select a city"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search city..."
                        onValueChange={(value) =>
                          selectedCountry &&
                          selectedState &&
                          fetchCities(
                            selectedCountry.id,
                            selectedState.id,
                            value
                          )
                        }
                      />
                      <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.name}
                              onSelect={() => {
                                setSelectedCity(city);
                                setCityPopupOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCity?.id === city.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {city.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input
                  id="zip"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </div>
          {/* Password */}
          <div className="space-y-4">
            <h3 className="font-medium">Password</h3>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>

              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getPasswordStrengthColor()
                        )}
                        style={{
                          width: `${(passwordStrengthScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li
                      className={
                        passwordStrength.hasMinLength ? "text-success" : ""
                      }
                    >
                      ✓ At least 8 characters
                    </li>
                    <li
                      className={
                        passwordStrength.hasUppercase ? "text-success" : ""
                      }
                    >
                      ✓ At least one uppercase letter
                    </li>
                    <li
                      className={
                        passwordStrength.hasLowercase ? "text-success" : ""
                      }
                    >
                      ✓ At least one lowercase letter
                    </li>
                    <li
                      className={
                        passwordStrength.hasNumber ? "text-success" : ""
                      }
                    >
                      ✓ At least one number
                    </li>
                    <li
                      className={
                        passwordStrength.hasSpecialChar ? "text-success" : ""
                      }
                    >
                      ✓ At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                aria-required="true"
              />
              {password &&
                confirmPassword &&
                password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    Passwords don't match
                  </p>
                )}
            </div>
          </div>
          {/* Company Document Upload */}
          <div>
            <CompanyDocumentUpload
              onFileChange={(file, type) => {
                setDocumentFile(file);
                setDocumentType(type);
              }}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-brand hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/employer/login" className="text-brand hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </RegularLayout>
  );
};

export default SignUp;
